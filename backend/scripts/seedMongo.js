/**
 * Seed MongoDB from the committed source data (films, running instances, film metadata).
 *
 * Idempotent upsert — see db/sync.js. Runs on every Railway boot (npm run start:railway)
 * and by hand with `npm run db:seed`.
 */

require('dotenv').config();
const { connectMongo, closeMongo } = require('../db/mongodb');
const { syncFromSource } = require('../db/sync');

async function seedDatabase() {
  console.log('🌱 Syncing MongoDB from source data...');
  const db = await connectMongo();
  try {
    const { films, instances, metadata } = await syncFromSource(db);
    console.log(`   ✓ Films: ${films.count} (${films.upserted} new, ${films.modified} updated)`);
    console.log(
      `   ✓ Running instances: ${instances.count} across ${instances.films} films (${instances.upserted} new)`
    );
    for (const film of instances.unmatched) {
      console.warn(`   ⚠️  Skipped instance, film not found: ${film}`);
    }
    console.log(`   ✓ Film metadata entries: ${metadata.count}`);
  } finally {
    await closeMongo();
  }
}

seedDatabase()
  .then(() => {
    console.log('✨ MongoDB sync complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB sync failed:', error);
    process.exit(1);
  });
