require('dotenv').config();
const pool = require('../db/postgres');

/**
 * Data Sources for enrichedMovieData.json:
 *
 * 1. Running Distance Data (distance, score fields):
 *    - Original Source: Rotten Tomatoes Editorial (2018, updated 2025)
 *      https://editorial.rottentomatoes.com/article/the-more-tom-cruise-runs-the-better-his-movies-are/
 *    - CSV Compilation: GitHub user gshick (Run_Tom_Run repository, GPL-3.0)
 *      https://github.com/gshick/Run_Tom_Run
 *    - Methodology: 14.6 feet/second (6-minute mile pace)
 *
 * 2. Film Metadata (runtime, poster_url, imdb_id, tmdb_id):
 *    - Source: The Movie Database (TMDB) API v3
 *      https://www.themoviedb.org
 *    - Fetched via: fetchRuntimes.js script
 *    - Attribution: This product uses the TMDB API but is not endorsed or certified by TMDB.
 */
const movieData = require('./enrichedMovieData.json');

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding database with full filmography...\n');

    await client.query('BEGIN');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await client.query('TRUNCATE TABLE running_instances, films RESTART IDENTITY CASCADE');

    // Insert films and running instances
    console.log('📽️  Inserting films and running data...');

    for (const movie of movieData) {
      // Insert Film with real runtime data from TMDB
      const filmResult = await client.query(
        `INSERT INTO films (title, year, runtime_minutes, rotten_tomatoes_score, imdb_id, tmdb_id, poster_url, rotten_tomatoes_url, wikipedia_url, youtube_trailer_url, letterboxd_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id`,
        [
          movie.title,
          movie.year,
          movie.runtime,
          movie.score,
          movie.imdb_id,
          movie.tmdb_id,
          movie.poster_url,
          movie.rotten_tomatoes_url,
          movie.wikipedia_url,
          movie.youtube_trailer_url,
          movie.letterboxd_url,
        ]
      );
      const filmId = filmResult.rows[0].id;

      // Insert Running Instance (if distance > 0)
      if (movie.distance > 0) {
        // Estimate duration: assume average running speed of ~6 mph (880 ft/min or ~14.7 ft/sec)
        // This gives us realistic durations that sum to approximately the original HTML total
        const estimatedDuration = movie.distance / 14.7;

        await client.query(
          `INSERT INTO running_instances
           (film_id, sequence_number, distance_feet, duration_seconds, context, intensity, location)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            filmId,
            1,
            movie.distance,
            estimatedDuration,
            'Total run distance from analysis',
            'various',
            'various',
          ]
        );
      }
    }
    console.log(`   ✓ Inserted ${movieData.length} films\n`);

    await client.query('COMMIT');

    // Display summary stats
    const statsResult = await client.query(`
      SELECT
        COUNT(*) as film_count,
        SUM(total_running_distance_feet) as total_distance
      FROM films
    `);

    const stats = statsResult.rows[0];
    console.log('📊 Database seeded successfully!');
    console.log('   ═══════════════════════════════════════');
    console.log(`   Total Films: ${stats.film_count}`);
    console.log(
      `   Total Running Distance: ${stats.total_distance} feet (${(stats.total_distance / 5280).toFixed(2)} miles)`
    );
    console.log('   ═══════════════════════════════════════\n');

    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    client.release();
    await pool.end();
    process.exit(1);
  }
}

seedDatabase();
