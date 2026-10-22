/**
 * Production entrypoint: sync MongoDB from the bundled data, then start the server.
 *
 * The production image is distroless (no shell), so this replaces the old npm script
 * `(node scripts/seedMongo.js || echo 'WARNING: ...') && node index.js`. Seeding runs in a
 * child process because seedMongo.js ends with process.exit(). A failed sync is logged
 * and the server starts anyway with whatever data the database already has.
 *
 * In the container this process is PID 1, which ignores SIGTERM unless a handler is
 * installed, so a stop that arrives during the seed (Mongo server selection can take
 * ~30s) is handled here: stop the seed and exit. index.js installs its own graceful
 * shutdown once the server starts.
 */
const { spawn } = require('node:child_process');
const path = require('node:path');

const seed = spawn(process.execPath, [path.join(__dirname, 'seedMongo.js')], {
  stdio: 'inherit',
});

const SIGNAL_EXIT_CODES = { SIGTERM: 143, SIGINT: 130 };
const stopDuringSeed = (signal) => {
  seed.kill(signal);
  process.exit(SIGNAL_EXIT_CODES[signal]);
};
const onSigterm = () => stopDuringSeed('SIGTERM');
const onSigint = () => stopDuringSeed('SIGINT');
process.on('SIGTERM', onSigterm);
process.on('SIGINT', onSigint);

let started = false;
const startServer = (seedFailed) => {
  // 'exit' may or may not follow an 'error', so start exactly once.
  if (started) return;
  started = true;
  process.off('SIGTERM', onSigterm);
  process.off('SIGINT', onSigint);
  if (seedFailed) {
    console.warn('WARNING: MongoDB sync failed; starting with existing data');
  }
  require('../index.js');
};

seed.on('error', () => startServer(true));
seed.on('exit', (code) => startServer(code !== 0));
