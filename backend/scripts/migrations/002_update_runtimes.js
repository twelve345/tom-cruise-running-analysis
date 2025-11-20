require('dotenv').config();
const pool = require('../../db/postgres');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting runtime/poster/IMDB migration...\n');

    // Load enriched data
    const dataPath = path.join(__dirname, '../enrichedMovieData.json');
    const enrichedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`📊 Loaded ${enrichedData.length} films from enrichedMovieData.json\n`);

    await client.query('BEGIN');

    // Get current CPI rankings for comparison
    const beforeCPI = await client.query(`
      SELECT title, cpi_score
      FROM films
      WHERE cpi_score IS NOT NULL AND cpi_score > 0
      ORDER BY cpi_score DESC
      LIMIT 10
    `);

    console.log('📈 Top 10 CPI BEFORE migration:');
    if (beforeCPI.rows.length > 0) {
      beforeCPI.rows.forEach((row, idx) => {
        const cpi = typeof row.cpi_score === 'number' ? row.cpi_score.toFixed(2) : row.cpi_score;
        console.log(`   ${idx + 1}. ${row.title}: ${cpi}`);
      });
    } else {
      console.log('   (No CPI scores found - this is expected for fresh database)');
    }
    console.log();

    // Update each film
    let updated = 0;
    let failed = 0;

    for (const movie of enrichedData) {
      if (!movie.runtime) {
        console.log(`⚠️  Skipping ${movie.title} - no runtime data`);
        failed++;
        continue;
      }

      const result = await client.query(
        `UPDATE films
         SET runtime_minutes = $1,
             imdb_id = $2,
             poster_url = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE title = $4 AND year = $5`,
        [movie.runtime, movie.imdb_id, movie.poster_url, movie.title, movie.year]
      );

      if (result.rowCount > 0) {
        console.log(`✓ ${movie.title} (${movie.year}): ${movie.runtime} min`);
        updated++;
      } else {
        console.log(`❌ Failed to update ${movie.title} (${movie.year})`);
        failed++;
      }
    }

    await client.query('COMMIT');

    console.log(`\n${'='.repeat(50)}`);
    console.log(`✅ Migration complete!`);
    console.log(`${'='.repeat(50)}`);
    console.log(`📊 Updated: ${updated}/${enrichedData.length} films`);
    console.log(`⚠️  Failed: ${failed}/${enrichedData.length} films\n`);

    // Get new CPI rankings
    const afterCPI = await client.query(`
      SELECT title, runtime_minutes, cpi_score, running_density
      FROM films
      WHERE cpi_score IS NOT NULL
      ORDER BY cpi_score DESC
      LIMIT 10
    `);

    console.log('📈 Top 10 CPI AFTER migration:');
    afterCPI.rows.forEach((row, idx) => {
      const before = beforeCPI.rows[idx];
      const change = before && before.title === row.title ? '' : '🔄 (rank changed)';
      const cpi = typeof row.cpi_score === 'number' ? row.cpi_score.toFixed(2) : 'N/A';
      const density =
        typeof row.running_density === 'number' ? row.running_density.toFixed(2) : 'N/A';
      console.log(`   ${idx + 1}. ${row.title}: ${cpi} ${change}`);
      console.log(`      Runtime: ${row.runtime_minutes} min | Density: ${density} ft/min`);
    });

    // Validation queries
    console.log(`\n${'='.repeat(50)}`);
    console.log('🔍 Validation Checks:');
    console.log(`${'='.repeat(50)}`);

    const validations = [
      {
        query: 'SELECT COUNT(*) as count FROM films WHERE runtime_minutes = 120',
        desc: 'Films still at 120 min default',
        expect: '0',
      },
      {
        query: 'SELECT COUNT(*) as count FROM films WHERE runtime_minutes IS NOT NULL',
        desc: 'Films with runtime data',
        expect: '44',
      },
      {
        query: 'SELECT COUNT(*) as count FROM films WHERE poster_url IS NOT NULL',
        desc: 'Films with poster URLs',
        expect: '44',
      },
      {
        query: 'SELECT COUNT(*) as count FROM films WHERE imdb_id IS NOT NULL',
        desc: 'Films with IMDB IDs',
        expect: '44',
      },
      {
        query: 'SELECT MIN(runtime_minutes) as min, MAX(runtime_minutes) as max FROM films',
        desc: 'Runtime range',
        expect: 'varies',
      },
    ];

    for (const validation of validations) {
      const result = await client.query(validation.query);
      const value = validation.desc.includes('range')
        ? `${result.rows[0].min}-${result.rows[0].max} min`
        : result.rows[0].count;
      const status =
        validation.expect === 'varies' || value.toString() === validation.expect ? '✅' : '⚠️';
      console.log(`${status} ${validation.desc}: ${value}`);
    }

    console.log(
      `\n✨ Migration successful! CPI scores and running density have been recalculated.`
    );
    console.log(`📋 Next step: Update seedDb.js with the enriched data for fresh installs.\n`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed!');
    console.error('Error:', error.message);
    console.error('\nDatabase has been rolled back to previous state.');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
