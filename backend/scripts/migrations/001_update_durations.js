require('dotenv').config();
const pool = require('../db/postgres');

/**
 * Migration: Update running instance durations
 * This migration updates all running instances to have realistic duration values
 * based on distance (assuming ~6 mph running speed)
 */
async function migrate() {
  const client = await pool.connect();

  try {
    console.log('🔄 Running migration: Update running instance durations...\n');

    await client.query('BEGIN');

    // Update all running instances with estimated durations
    const result = await client.query(`
      UPDATE running_instances
      SET duration_seconds = distance_feet / 14.7
      WHERE duration_seconds = 0 OR duration_seconds IS NULL
    `);

    console.log(`✓ Updated ${result.rowCount} running instances with duration calculations`);

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully!\n');

    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    client.release();
    await pool.end();
    process.exit(1);
  }
}

migrate();
