/**
 * Production entrypoint: sync MongoDB from the bundled data, then start the server.
 *
 * The production image is distroless (no shell), so this replaces the old npm script
 * `(node scripts/seedMongo.js || echo 'WARNING: ...') && node index.js`. Seeding runs in a
 * child process because seedMongo.js ends with process.exit(). A failed sync is logged
 * and the server starts anyway with whatever data the database already has.
 */
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const seed = spawnSync(process.execPath, [path.join(__dirname, 'seedMongo.js')], {
  stdio: 'inherit',
});

if (seed.error || seed.status !== 0) {
  console.warn('WARNING: MongoDB sync failed; starting with existing data');
}

require('../index.js');
