/**
 * Data Sync Migration - Repeatable
 *
 * Syncs database with enrichedMovieData.json
 * - Inserts new films
 * - Updates existing films with latest data
 * - Calculates running totals
 *
 * REPEATABLE: Runs on every deploy to keep DB in sync with source data
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function syncFilmData() {
  const client = await pool.connect();

  try {
    console.log('📊 Syncing film data from enrichedMovieData.json...\n');

    // Load source data
    const dataPath = path.join(__dirname, '../enrichedMovieData.json');
    const filmData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`   Found ${filmData.length} films in source data`);

    await client.query('BEGIN');

    let inserted = 0;
    let updated = 0;

    for (const film of filmData) {
      // UPSERT film data
      const result = await client.query(
        `
        INSERT INTO films (
          title, year, total_running_distance_feet, rotten_tomatoes_score,
          runtime_minutes, imdb_id, tmdb_id, poster_url,
          rotten_tomatoes_url, wikipedia_url, youtube_trailer_url, letterboxd_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (title, year)
        DO UPDATE SET
          total_running_distance_feet = EXCLUDED.total_running_distance_feet,
          rotten_tomatoes_score = EXCLUDED.rotten_tomatoes_score,
          runtime_minutes = EXCLUDED.runtime_minutes,
          imdb_id = EXCLUDED.imdb_id,
          tmdb_id = EXCLUDED.tmdb_id,
          poster_url = EXCLUDED.poster_url,
          rotten_tomatoes_url = EXCLUDED.rotten_tomatoes_url,
          wikipedia_url = EXCLUDED.wikipedia_url,
          youtube_trailer_url = EXCLUDED.youtube_trailer_url,
          letterboxd_url = EXCLUDED.letterboxd_url,
          updated_at = CURRENT_TIMESTAMP
        RETURNING (xmax = 0) AS inserted
      `,
        [
          film.title,
          film.year,
          film.distance || null,
          film.score || null,
          film.runtime || null,
          film.imdb_id || null,
          film.tmdb_id || null,
          film.poster_url || null,
          film.rotten_tomatoes_url || null,
          film.wikipedia_url || null,
          film.youtube_trailer_url || null,
          film.letterboxd_url || null,
        ]
      );

      if (result.rows[0].inserted) {
        inserted++;
      } else {
        updated++;
      }
    }

    await client.query('COMMIT');

    console.log(`\n   ✓ Data sync complete:`);
    console.log(`     - ${inserted} new films inserted`);
    console.log(`     - ${updated} existing films updated`);
    console.log(`     - ${filmData.length} total films in database`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n   ❌ Data sync failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Export for migration runner
module.exports = syncFilmData;

// Allow direct execution
if (require.main === module) {
  syncFilmData()
    .then(() => {
      console.log('\n✨ Film data sync complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Film data sync failed:', error);
      process.exit(1);
    })
    .finally(() => pool.end());
}
