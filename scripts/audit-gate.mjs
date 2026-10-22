#!/usr/bin/env node
/**
 * Dependency audit gate: `npm audit` at --audit-level=high, honouring one strict OpenVEX
 * document (.fleet/vex.openvex.json) as the only suppression.
 *
 * This follows the Abacus fleet rule (abacus-fleet-control conventions §16, "VEX: the only
 * suppression"): fix the finding or remove its dependency path; only when neither is
 * possible may an exact package@version be declared `not_affected`. The fleet's shared
 * `vex-audit` action lives in a private repository this public repo can't call, so this is
 * a local equivalent with the same rules:
 *
 * - A high/critical advisory passes only when a statement names its GHSA id AND every
 *   locked version of the affected package as an exact purl.
 * - Every statement must be strictly shaped, and its package@version must still be in
 *   package-lock.json; a stale statement fails the gate until it is deleted.
 * - Anything unexpected (npm audit erroring, unparseable output, a malformed VEX) fails.
 *
 * Exit codes: 0 pass, 1 unsuppressed findings or stale statements, 2 invalid input/error.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const GATED_SEVERITIES = new Set(['high', 'critical']);
const JUSTIFICATIONS = new Set([
  'component_not_present',
  'vulnerable_code_not_present',
  'vulnerable_code_not_in_execute_path',
  'vulnerable_code_cannot_be_controlled_by_adversary',
  'inline_mitigations_already_exist',
]);
const CVE = /^CVE-\d{4}-\d{4,}$/;
const GHSA = /^GHSA(-[23456789cfghjmpqrvwx]{4}){3}$/;
// pkg:npm/<name>@<exact semver>: no ranges, wildcards, qualifiers or subpaths.
const EXACT_NPM_PURL =
  /^pkg:npm\/((?:%40[a-z0-9._~-]+\/)?[a-z0-9._~-]+)@(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/;
const MIN_IMPACT_STATEMENT = 40;

export class GateInputError extends Error {}

/** Validate the VEX document strictly; returns [{ ids:Set, purls:Set }]. Throws GateInputError. */
export function parseVex(doc) {
  const fail = (msg) => {
    throw new GateInputError(`.fleet/vex.openvex.json: ${msg}`);
  };
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) fail('not a JSON object');
  if (doc['@context'] !== 'https://openvex.dev/ns/v0.2.0') fail('@context must be OpenVEX v0.2.0');
  if (!Array.isArray(doc.statements)) fail('statements must be an array');
  return doc.statements.map((s, i) => {
    const at = `statement ${i}`;
    if (!s || typeof s !== 'object') fail(`${at}: not an object`);
    if (s.status !== 'not_affected') fail(`${at}: status must be "not_affected"`);
    if (!JUSTIFICATIONS.has(s.justification)) fail(`${at}: unknown justification`);
    if (
      typeof s.impact_statement !== 'string' ||
      s.impact_statement.trim().length < MIN_IMPACT_STATEMENT
    )
      fail(`${at}: impact_statement must explain the evidence`);
    const v = s.vulnerability;
    if (!v || !CVE.test(v.name ?? '')) fail(`${at}: vulnerability.name must be a CVE id`);
    const aliases = Array.isArray(v.aliases) ? v.aliases : [];
    const ghsas = aliases.filter((a) => GHSA.test(a));
    if (ghsas.length === 0) fail(`${at}: vulnerability.aliases must include the GHSA id`);
    if (!Array.isArray(s.products) || s.products.length === 0) fail(`${at}: products required`);
    const purls = s.products.map((p, j) => {
      const keys = p && typeof p === 'object' ? Object.keys(p) : [];
      if (keys.length !== 1 || keys[0] !== '@id')
        fail(`${at}: product ${j} must be exactly {"@id": purl}`);
      if (!EXACT_NPM_PURL.test(p['@id']))
        fail(`${at}: product ${j} must be an exact-version npm purl`);
      return p['@id'];
    });
    return {
      ids: new Set([v.name, ...ghsas].map((id) => id.toLowerCase())),
      purls: new Set(purls),
    };
  });
}

const purlFor = (name, version) => `pkg:npm/${name.replace(/^@/, '%40')}@${version}`;
const advisoryId = (url) => (url?.match(/\/advisories\/(GHSA-[\w-]+)$/i) ?? [])[1]?.toLowerCase();

/** Every locked version of a package, keyed by purl. */
function lockedPurls(lock) {
  const purls = new Set();
  for (const [p, entry] of Object.entries(lock.packages ?? {})) {
    const m = p.match(/(?:^|\/)node_modules\/((?:@[^/]+\/)?[^/]+)$/);
    if (m && entry?.version) purls.add(purlFor(m[1], entry.version));
  }
  return purls;
}

/**
 * Decide the gate. `audit` is `npm audit --json` output, `lock` is package-lock.json,
 * `vexDoc` is the parsed VEX document or null. Returns { failures, suppressed, reported }.
 */
export function evaluate({ audit, lock, vexDoc }) {
  if (
    !audit ||
    typeof audit !== 'object' ||
    audit.error ||
    typeof audit.vulnerabilities !== 'object'
  )
    throw new GateInputError(
      `npm audit did not return a report: ${JSON.stringify(audit?.error ?? audit).slice(0, 300)}`
    );
  const statements = vexDoc ? parseVex(vexDoc) : [];
  const locked = lockedPurls(lock);
  const failures = [];
  const suppressed = [];
  const reported = [];

  for (const s of statements)
    for (const purl of s.purls)
      if (!locked.has(purl))
        failures.push(`stale VEX statement: ${purl} is no longer in package-lock.json; delete it`);

  for (const [name, vuln] of Object.entries(audit.vulnerabilities)) {
    // Only advisory objects are findings; string entries are dependents of another package.
    const advisories = (vuln.via ?? []).filter((v) => v && typeof v === 'object');
    if (advisories.length === 0) continue;
    const versions = [
      ...new Set((vuln.nodes ?? []).map((n) => lock.packages?.[n]?.version).filter(Boolean)),
    ];
    for (const adv of advisories) {
      const label = `${adv.severity} ${advisoryId(adv.url) ?? adv.url ?? adv.source} in ${name}@${versions.join(',') || '?'} (${adv.title})`;
      if (!GATED_SEVERITIES.has(adv.severity)) {
        reported.push(label);
        continue;
      }
      const id = advisoryId(adv.url);
      const covered =
        id !== undefined &&
        versions.length > 0 &&
        versions.every((ver) =>
          statements.some((s) => s.ids.has(id) && s.purls.has(purlFor(adv.dependency ?? name, ver)))
        );
      (covered ? suppressed : failures).push(label);
    }
  }
  return { failures, suppressed, reported };
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const run = spawnSync('npm', ['audit', '--json'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 << 20,
  });
  if (run.error) throw new GateInputError(`could not run npm audit: ${run.error.message}`);
  let audit;
  try {
    audit = JSON.parse(run.stdout);
  } catch {
    throw new GateInputError(
      `npm audit output is not JSON (exit ${run.status}): ${run.stderr.slice(0, 300)}`
    );
  }
  const lock = JSON.parse(readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  const vexPath = path.join(root, '.fleet', 'vex.openvex.json');
  const vexDoc = existsSync(vexPath) ? JSON.parse(readFileSync(vexPath, 'utf8')) : null;

  const { failures, suppressed, reported } = evaluate({ audit, lock, vexDoc });
  for (const r of reported) console.log(`reported (below gate): ${r}`);
  for (const s of suppressed) console.log(`suppressed by VEX: ${s}`);
  for (const f of failures) console.error(`FAIL: ${f}`);
  console.log(
    failures.length === 0 ? 'audit gate: pass' : `audit gate: ${failures.length} failure(s)`
  );
  return failures.length === 0 ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main();
  } catch (err) {
    console.error(`audit gate error: ${err.message}`);
    process.exitCode = 2;
  }
}
