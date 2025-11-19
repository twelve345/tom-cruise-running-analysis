require('dotenv').config();
const pool = require('../db/postgres');

// Data from tomcruiserunnningtime.html
const movieData = [
  { title: 'Endless Love', year: 1981, distance: 43, score: 25 },
  { title: 'Taps', year: 1981, distance: 301, score: 71 },
  { title: 'The Outsiders', year: 1983, distance: 231, score: 65 },
  { title: "Losin' It", year: 1983, distance: 102, score: 13 },
  { title: 'Risky Business', year: 1983, distance: 215, score: 92 },
  { title: 'All the Right Moves', year: 1983, distance: 298, score: 61 },
  { title: 'Legend', year: 1985, distance: 198, score: 38 },
  { title: 'Top Gun', year: 1986, distance: 211, score: 58 },
  { title: 'The Color of Money', year: 1986, distance: 0, score: 88 },
  { title: 'Cocktail', year: 1988, distance: 151, score: 9 },
  { title: 'Rain Man', year: 1988, distance: 98, score: 89 },
  { title: 'Born on the Fourth of July', year: 1989, distance: 405, score: 85 },
  { title: 'Days of Thunder', year: 1990, distance: 333, score: 38 },
  { title: 'Far and Away', year: 1992, distance: 243, score: 50 },
  { title: 'A Few Good Men', year: 1992, distance: 0, score: 84 },
  { title: 'The Firm', year: 1993, distance: 1241, score: 76 },
  { title: 'Interview with the Vampire', year: 1994, distance: 0, score: 64 },
  { title: 'Mission: Impossible', year: 1996, distance: 962, score: 66 },
  { title: 'Jerry Maguire', year: 1996, distance: 153, score: 85 },
  { title: 'Eyes Wide Shut', year: 1999, distance: 0, score: 75 },
  { title: 'Magnolia', year: 1999, distance: 0, score: 84 },
  { title: 'Mission: Impossible II', year: 2000, distance: 397, score: 56 },
  { title: 'Vanilla Sky', year: 2001, distance: 832, score: 42 },
  { title: 'Minority Report', year: 2002, distance: 1562, score: 90 },
  { title: 'The Last Samurai', year: 2003, distance: 602, score: 66 },
  { title: 'Collateral', year: 2004, distance: 887, score: 86 },
  { title: 'War of the Worlds', year: 2005, distance: 1752, score: 75 },
  { title: 'Mission: Impossible III', year: 2006, distance: 3212, score: 71 },
  { title: 'Lions for Lambs', year: 2007, distance: 0, score: 27 },
  { title: 'Tropic Thunder', year: 2008, distance: 0, score: 82 },
  { title: 'Valkyrie', year: 2008, distance: 111, score: 62 },
  { title: 'Knight and Day', year: 2010, distance: 942, score: 52 },
  { title: 'Mission: Impossible - Ghost Protocol', year: 2011, distance: 3066, score: 93 },
  { title: 'Rock of Ages', year: 2012, distance: 0, score: 42 },
  { title: 'Jack Reacher', year: 2012, distance: 411, score: 63 },
  { title: 'Oblivion', year: 2013, distance: 812, score: 54 },
  { title: 'Edge of Tomorrow', year: 2014, distance: 1065, score: 91 },
  { title: 'Mission: Impossible - Rogue Nation', year: 2015, distance: 1518, score: 94 },
  { title: 'Jack Reacher: Never Go Back', year: 2016, distance: 1051, score: 38 },
  { title: 'The Mummy', year: 2017, distance: 1022, score: 15 },
  { title: 'American Made', year: 2017, distance: 35, score: 85 },
  { title: 'Mission: Impossible - Fallout', year: 2018, distance: 2628, score: 97 },
  { title: 'Top Gun: Maverick', year: 2022, distance: 550, score: 96 },
  { title: 'Mission: Impossible - Dead Reckoning Part One', year: 2023, distance: 2131, score: 96 },
];

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
      // Insert Film
      // Note: We are using default runtime (120) since we don't have it in the HTML data for all films
      // In a real app, we would fetch this from an API (OMDB/TMDB)
      const filmResult = await client.query(
        `INSERT INTO films (title, year, runtime_minutes, rotten_tomatoes_score)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [movie.title, movie.year, 120, movie.score]
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
        SUM(total_running_distance_feet) as total_distance,
        SUM(running_instances_count) as total_instances
      FROM films
    `);

    const stats = statsResult.rows[0];
    console.log('📊 Database seeded successfully!');
    console.log('   ═══════════════════════════════════════');
    console.log(`   Total Films: ${stats.film_count}`);
    console.log(
      `   Total Running Distance: ${stats.total_distance} feet (${(stats.total_distance / 5280).toFixed(2)} miles)`
    );
    console.log(`   Total Running Instances: ${stats.total_instances}`);
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
