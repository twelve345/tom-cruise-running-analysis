// Fixture tests for scripts/audit-gate.mjs: one case per row of the gate's state table.
// Run with: node --test scripts/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, parseVex, GateInputError } from './audit-gate.mjs';

const GHSA_URL = 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm';

const lock = (entries) => ({
  packages: Object.fromEntries(entries.map(([p, version]) => [p, { version }])),
});

const advisory = (overrides = {}) => ({
  source: 1,
  name: 'braces',
  dependency: 'braces',
  title: 'stack exhaustion',
  url: GHSA_URL,
  severity: 'high',
  ...overrides,
});

const audit = (vulnerabilities) => ({ auditReportVersion: 2, vulnerabilities, metadata: {} });

const statement = (overrides = {}) => ({
  vulnerability: { name: 'CVE-2026-93687', aliases: ['GHSA-vfj7-8cjw-p6xm'] },
  products: [{ '@id': 'pkg:npm/braces@3.0.3' }],
  status: 'not_affected',
  justification: 'vulnerable_code_cannot_be_controlled_by_adversary',
  impact_statement: 'Reached only through graphql-codegen globbing patterns from codegen.ts.',
  ...overrides,
});

const vex = (...statements) => ({ '@context': 'https://openvex.dev/ns/v0.2.0', statements });

const bracesLock = lock([['node_modules/braces', '3.0.3']]);
const bracesAudit = audit({
  braces: { name: 'braces', severity: 'high', via: [advisory()], nodes: ['node_modules/braces'] },
  micromatch: {
    name: 'micromatch',
    severity: 'high',
    via: ['braces'],
    nodes: ['node_modules/micromatch'],
  },
});

test('clean audit passes', () => {
  const r = evaluate({ audit: audit({}), lock: bracesLock, vexDoc: null });
  assert.deepEqual(r.failures, []);
});

test('a high advisory fails without VEX', () => {
  const r = evaluate({ audit: bracesAudit, lock: bracesLock, vexDoc: null });
  assert.equal(r.failures.length, 1);
  assert.match(r.failures[0], /ghsa-vfj7-8cjw-p6xm in braces@3\.0\.3/);
});

test('an exact statement suppresses the advisory; dependents are not separate findings', () => {
  const r = evaluate({ audit: bracesAudit, lock: bracesLock, vexDoc: vex(statement()) });
  assert.deepEqual(r.failures, []);
  assert.equal(r.suppressed.length, 1);
});

test('a statement for another version does not suppress', () => {
  const r = evaluate({
    audit: bracesAudit,
    lock: lock([
      ['node_modules/braces', '3.0.3'],
      ['x/node_modules/braces', '3.0.2'],
    ]),
    vexDoc: vex(statement({ products: [{ '@id': 'pkg:npm/braces@3.0.2' }] })),
  });
  assert.equal(r.failures.length, 1);
});

test('every locked version must be covered', () => {
  const twoVersions = audit({
    braces: {
      name: 'braces',
      severity: 'high',
      via: [advisory()],
      nodes: ['node_modules/braces', 'pkg/node_modules/braces'],
    },
  });
  const r = evaluate({
    audit: twoVersions,
    lock: lock([
      ['node_modules/braces', '3.0.3'],
      ['pkg/node_modules/braces', '2.3.2'],
    ]),
    vexDoc: vex(statement()),
  });
  assert.equal(r.failures.length, 1);
});

test('a statement naming another advisory does not suppress', () => {
  const r = evaluate({
    audit: audit({
      braces: {
        name: 'braces',
        severity: 'high',
        via: [advisory({ url: 'https://github.com/advisories/GHSA-grv7-fg5c-xmjg' })],
        nodes: ['node_modules/braces'],
      },
    }),
    lock: bracesLock,
    vexDoc: vex(statement()),
  });
  assert.equal(r.failures.length, 1);
});

test('an advisory without a GHSA id can never be suppressed', () => {
  const r = evaluate({
    audit: audit({
      braces: {
        name: 'braces',
        severity: 'critical',
        via: [advisory({ url: undefined })],
        nodes: ['node_modules/braces'],
      },
    }),
    lock: bracesLock,
    vexDoc: vex(statement()),
  });
  assert.equal(r.failures.length, 1);
});

test('moderate and low advisories are reported, not gated', () => {
  const r = evaluate({
    audit: audit({
      braces: {
        name: 'braces',
        severity: 'moderate',
        via: [advisory({ severity: 'moderate' })],
        nodes: ['node_modules/braces'],
      },
    }),
    lock: bracesLock,
    vexDoc: null,
  });
  assert.deepEqual(r.failures, []);
  assert.equal(r.reported.length, 1);
});

test('a stale statement fails the gate', () => {
  const r = evaluate({
    audit: audit({}),
    lock: lock([['node_modules/braces', '3.0.4']]),
    vexDoc: vex(statement()),
  });
  assert.equal(r.failures.length, 1);
  assert.match(r.failures[0], /stale VEX statement/);
});

test('an audit error body or missing report fails closed', () => {
  assert.throws(
    () => evaluate({ audit: { error: { code: 'ENOTFOUND' } }, lock: bracesLock, vexDoc: null }),
    GateInputError
  );
  assert.throws(() => evaluate({ audit: {}, lock: bracesLock, vexDoc: null }), GateInputError);
  assert.throws(() => evaluate({ audit: null, lock: bracesLock, vexDoc: null }), GateInputError);
});

test('malformed statements are rejected', () => {
  const bad = [
    statement({ status: 'fixed' }),
    statement({ justification: 'trust me' }),
    statement({ impact_statement: 'n/a' }),
    statement({ vulnerability: { name: 'GHSA-vfj7-8cjw-p6xm', aliases: [] } }),
    statement({ vulnerability: { name: 'CVE-2026-93687', aliases: [] } }),
    statement({ products: [{ '@id': 'pkg:npm/braces' }] }),
    statement({ products: [{ '@id': 'pkg:npm/braces@^3.0.0' }] }),
    statement({ products: [{ '@id': 'pkg:npm/braces@3.0.3?arch=x' }] }),
    statement({ products: [{ '@id': 'pkg:npm/braces@3.0.3', subcomponents: [] }] }),
    statement({ products: [] }),
  ];
  for (const s of bad) assert.throws(() => parseVex(vex(s)), GateInputError, JSON.stringify(s));
  assert.throws(() => parseVex({ statements: [] }), GateInputError);
});

test('scoped package purls match', () => {
  const r = evaluate({
    audit: audit({
      '@scope/pkg': {
        name: '@scope/pkg',
        severity: 'high',
        via: [advisory({ name: '@scope/pkg', dependency: '@scope/pkg' })],
        nodes: ['node_modules/@scope/pkg'],
      },
    }),
    lock: lock([['node_modules/@scope/pkg', '1.2.3']]),
    vexDoc: vex(statement({ products: [{ '@id': 'pkg:npm/%40scope/pkg@1.2.3' }] })),
  });
  assert.deepEqual(r.failures, []);
});
