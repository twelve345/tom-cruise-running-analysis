/**
 * Database Migration Runner
 *
 * Automatically runs all pending migrations in the migrations/ directory.
 * Tracks which migrations have been applied using a migrations table.
 * Safe to run multiple times (idempotent).
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getAppliedMigrations() {
  const result = await pool.query(
    'SELECT migration_name FROM schema_migrations ORDER BY migration_name'
  );
  return result.rows.map((row) => row.migration_name);
}

async function markMigrationAsApplied(migrationName) {
  await pool.query(
    'INSERT INTO schema_migrations (migration_name) VALUES ($1) ON CONFLICT (migration_name) DO NOTHING',
    [migrationName]
  );
}

async function runMigrations() {
  try {
    console.log('🔄 Starting migration process...\n');

    // Ensure migrations tracking table exists
    await ensureMigrationsTable();

    // Get list of already applied migrations
    const appliedMigrations = await getAppliedMigrations();
    console.log(`✓ Found ${appliedMigrations.length} previously applied migrations\n`);

    // Get list of migration files
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.log('📂 No migrations directory found. Skipping migrations.');
      return;
    }

    const migrationFiles = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.js'))
      .sort(); // Ensure migrations run in order

    if (migrationFiles.length === 0) {
      console.log('✓ No migration files found. Nothing to run.');
      return;
    }

    console.log(`📋 Found ${migrationFiles.length} total migration files\n`);

    // Run pending migrations
    let migrationsRun = 0;
    let repeatableMigrationsRun = 0;

    for (const file of migrationFiles) {
      const migrationName = file.replace('.js', '');
      const isRepeatable = migrationName.includes('sync');

      // Skip if already applied (unless it's repeatable)
      if (appliedMigrations.includes(migrationName) && !isRepeatable) {
        console.log(`⏭️  Skipping ${migrationName} (already applied)`);
        continue;
      }

      // Indicate if repeatable
      if (isRepeatable) {
        console.log(`🔄 Running ${migrationName} (repeatable)...`);
      } else {
        console.log(`▶️  Running ${migrationName}...`);
      }

      try {
        const migrationPath = path.join(MIGRATIONS_DIR, file);
        // Clear require cache for repeatable migrations
        if (isRepeatable) {
          delete require.cache[require.resolve(migrationPath)];
        }
        const migration = require(migrationPath);

        // Run the migration
        if (typeof migration === 'function') {
          await migration();
        } else {
          console.error(`   ⚠️  Warning: ${file} does not export a function`);
          continue;
        }

        // Mark as applied (first time only)
        if (!appliedMigrations.includes(migrationName)) {
          await markMigrationAsApplied(migrationName);
        }

        console.log(`   ✓ ${migrationName} completed\n`);

        if (isRepeatable) {
          repeatableMigrationsRun++;
        } else {
          migrationsRun++;
        }
      } catch (error) {
        console.error(`   ❌ Error running ${migrationName}:`, error.message);
        throw error; // Stop on first error
      }
    }

    if (migrationsRun === 0 && repeatableMigrationsRun === 0) {
      console.log('✓ All migrations are up to date. No new migrations to run.');
    } else {
      const messages = [];
      if (migrationsRun > 0) {
        messages.push(`${migrationsRun} new migration(s)`);
      }
      if (repeatableMigrationsRun > 0) {
        messages.push(`${repeatableMigrationsRun} repeatable migration(s)`);
      }
      console.log(`\n✨ Successfully applied ${messages.join(' and ')}`);
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('\n🎉 Migration process complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Fatal error during migration:', error);
      process.exit(1);
    });
}

module.exports = runMigrations;
