require('dotenv').config();
const pool = require('../db/postgres');

// Sample data based on Tom Cruise's filmography
const sampleFilms = [
  {
    title: "Top Gun: Maverick",
    year: 2022,
    runtime: 131,
    rt_score: 96,
    imdb_id: "tt1745960"
  },
  {
    title: "Mission: Impossible - Fallout",
    year: 2018,
    runtime: 147,
    rt_score: 97,
    imdb_id: "tt4912910"
  },
  {
    title: "Mission: Impossible - Rogue Nation",
    year: 2015,
    runtime: 131,
    rt_score: 93,
    imdb_id: "tt2381249"
  },
  {
    title: "Edge of Tomorrow",
    year: 2014,
    runtime: 113,
    rt_score: 91,
    imdb_id: "tt1631867"
  },
  {
    title: "Mission: Impossible - Ghost Protocol",
    year: 2011,
    runtime: 133,
    rt_score: 93,
    imdb_id: "tt1229238"
  },
  {
    title: "Knight and Day",
    year: 2010,
    runtime: 109,
    rt_score: 52,
    imdb_id: "tt1013743"
  },
  {
    title: "Valkyrie",
    year: 2008,
    runtime: 121,
    rt_score: 62,
    imdb_id: "tt0985699"
  },
  {
    title: "Mission: Impossible III",
    year: 2006,
    runtime: 126,
    rt_score: 70,
    imdb_id: "tt0317919"
  },
  {
    title: "War of the Worlds",
    year: 2005,
    runtime: 116,
    rt_score: 75,
    imdb_id: "tt0407304"
  },
  {
    title: "Collateral",
    year: 2004,
    runtime: 120,
    rt_score: 86,
    imdb_id: "tt0369339"
  },
  {
    title: "The Last Samurai",
    year: 2003,
    runtime: 154,
    rt_score: 66,
    imdb_id: "tt0325710"
  },
  {
    title: "Minority Report",
    year: 2002,
    runtime: 145,
    rt_score: 90,
    imdb_id: "tt0181689"
  },
  {
    title: "Vanilla Sky",
    year: 2001,
    runtime: 136,
    rt_score: 42,
    imdb_id: "tt0259711"
  },
  {
    title: "Mission: Impossible II",
    year: 2000,
    runtime: 123,
    rt_score: 57,
    imdb_id: "tt0120755"
  },
  {
    title: "Mission: Impossible",
    year: 1996,
    runtime: 110,
    rt_score: 63,
    imdb_id: "tt0117060"
  },
  {
    title: "The Firm",
    year: 1993,
    runtime: 154,
    rt_score: 76,
    imdb_id: "tt0106918"
  },
  {
    title: "A Few Good Men",
    year: 1992,
    runtime: 138,
    rt_score: 83,
    imdb_id: "tt0104257"
  },
  {
    title: "Top Gun",
    year: 1986,
    runtime: 110,
    rt_score: 58,
    imdb_id: "tt0092099"
  },
  {
    title: "Risky Business",
    year: 1983,
    runtime: 99,
    rt_score: 92,
    imdb_id: "tt0086200"
  }
];

// Sample running instances for a few films
const sampleRunningInstances = [
  // Mission: Impossible - Fallout (extensive running)
  { filmTitle: "Mission: Impossible - Fallout", sequence: 1, distance: 1200, duration: 45.5, timestamp: "00:12:30", context: "Chasing antagonist through Paris streets", intensity: "sprint", location: "Paris, outdoor" },
  { filmTitle: "Mission: Impossible - Fallout", sequence: 2, distance: 850, duration: 32.0, context: "Rooftop chase sequence", intensity: "sprint", location: "London, outdoor" },
  { filmTitle: "Mission: Impossible - Fallout", sequence: 3, distance: 650, duration: 28.5, context: "Running from explosion", intensity: "sprint", location: "Kashmir, outdoor" },

  // Edge of Tomorrow (time loop running)
  { filmTitle: "Edge of Tomorrow", sequence: 1, distance: 400, duration: 18.0, context: "Training montage run", intensity: "jog", location: "Military base, outdoor" },
  { filmTitle: "Edge of Tomorrow", sequence: 2, distance: 920, duration: 38.0, context: "Beach invasion sprint", intensity: "sprint", location: "Beach, outdoor" },

  // Minority Report (futuristic chase)
  { filmTitle: "Minority Report", sequence: 1, distance: 1100, duration: 42.0, context: "Running from PreCrime in mall", intensity: "sprint", location: "Shopping mall, indoor" },
  { filmTitle: "Minority Report", sequence: 2, distance: 780, duration: 35.5, context: "Factory escape sequence", intensity: "sprint", location: "Factory, indoor" },

  // Top Gun: Maverick
  { filmTitle: "Top Gun: Maverick", sequence: 1, distance: 520, duration: 22.0, context: "Running to aircraft", intensity: "jog", location: "Naval base, outdoor" },

  // Mission: Impossible
  { filmTitle: "Mission: Impossible", sequence: 1, distance: 890, duration: 36.0, context: "CIA headquarters escape", intensity: "sprint", location: "Langley, indoor/outdoor" },

  // War of the Worlds
  { filmTitle: "War of the Worlds", sequence: 1, distance: 730, duration: 30.0, context: "Fleeing from alien attack", intensity: "sprint", location: "City street, outdoor" },

  // The Firm
  { filmTitle: "The Firm", sequence: 1, distance: 650, duration: 28.0, context: "Running from assassins", intensity: "sprint", location: "Memphis streets, outdoor" }
];

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding database with sample data...\n');

    await client.query('BEGIN');

    // Insert films
    console.log('📽️  Inserting films...');
    const filmIdMap = {};

    for (const film of sampleFilms) {
      const result = await client.query(
        `INSERT INTO films (title, year, runtime_minutes, rotten_tomatoes_score, imdb_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [film.title, film.year, film.runtime, film.rt_score, film.imdb_id]
      );
      filmIdMap[film.title] = result.rows[0].id;
    }
    console.log(`   ✓ Inserted ${sampleFilms.length} films\n`);

    // Insert running instances
    console.log('🏃 Inserting running instances...');
    for (const run of sampleRunningInstances) {
      const filmId = filmIdMap[run.filmTitle];
      if (filmId) {
        await client.query(
          `INSERT INTO running_instances
           (film_id, sequence_number, distance_feet, duration_seconds, timestamp_start, context, intensity, location)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [filmId, run.sequence, run.distance, run.duration, run.timestamp, run.context, run.intensity, run.location]
        );
      }
    }
    console.log(`   ✓ Inserted ${sampleRunningInstances.length} running instances\n`);

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
    console.log(`   Total Running Distance: ${stats.total_distance} feet (${(stats.total_distance / 5280).toFixed(2)} miles)`);
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
