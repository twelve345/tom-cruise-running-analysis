/**
 * Add UNIQUE constraint on (title, year) to films table
 *
 * Required for UPSERT operations in data sync migration
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function addUniqueConstraint() {
  const client = await pool.connect();

  try {
    console.log('   Adding UNIQUE constraint on (title, year)...');

    // Check if constraint already exists
    const checkConstraint = await client.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'films'
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'films_title_year_unique'
    `);

    if (checkConstraint.rows.length > 0) {
      console.log('   ⏭️  Constraint already exists, skipping');
      return;
    }

    // Add the constraint
    await client.query(`
      ALTER TABLE films
      ADD CONSTRAINT films_title_year_unique
      UNIQUE (title, year)
    `);

    console.log('   ✓ UNIQUE constraint added successfully');
  } catch (error) {
    // If error is because constraint already exists, that's fine
    if (error.code === '42P07' || error.message.includes('already exists')) {
      console.log('   ⏭️  Constraint already exists, skipping');
      return;
    }
    throw error;
  } finally {
    client.release();
  }
}

module.exports = addUniqueConstraint;

if (require.main === module) {
  addUniqueConstraint()
    .then(() => {
      console.log('Migration complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    })
    .finally(() => pool.end());
}
