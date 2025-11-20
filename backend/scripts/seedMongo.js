/**
 * Seed MongoDB with Running Instances and Film Metadata
 *
 * This script:
 * 1. Loads extracted295instances.json
 * 2. Maps instances to filmId from enrichedMovieData.json
 * 3. Calculates sequenceNumber per film
 * 4. Populates MongoDB runningInstances collection
 * 5. Creates sample filmMetadata for top films
 * 6. Creates indexes
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectMongo, getMongoDB, closeMongo } = require('../db/mongodb');

// Load data
const instancesPath = path.join(__dirname, 'extracted295instances.json');
const filmDataPath = path.join(__dirname, 'enrichedMovieData.json');

const instances = JSON.parse(fs.readFileSync(instancesPath, 'utf8'));
const filmData = JSON.parse(fs.readFileSync(filmDataPath, 'utf8'));

// Create film lookup map (title+year -> filmId)
const filmMap = new Map();
filmData.forEach((film, index) => {
  const key = `${film.title}|${film.year}`;
  filmMap.set(key, index + 1); // filmId starts at 1
});

async function seedDatabase() {
  try {
    console.log('🌱 Starting MongoDB seed process...\n');

    // Connect to MongoDB
    await connectMongo();
    const db = getMongoDB();

    // Get collections
    const runningInstancesCollection = db.collection('runninginstances');
    const filmMetadataCollection = db.collection('filmmetadata');

    // Clear existing data
    console.log('🧹 Clearing existing collections...');
    await runningInstancesCollection.deleteMany({});
    await filmMetadataCollection.deleteMany({});
    console.log('   ✓ Collections cleared\n');

    // ========================================================================
    // PART 1: Seed Running Instances
    // ========================================================================

    console.log('📽️  Processing running instances...');

    // Group instances by film to calculate sequence numbers
    const instancesByFilm = new Map();

    instances.forEach((instance) => {
      const key = `${instance.filmTitle}|${instance.filmYear}`;
      const filmId = filmMap.get(key);

      if (!filmId) {
        console.warn(
          `   ⚠️  Warning: Film not found - ${instance.filmTitle} (${instance.filmYear})`
        );
        return;
      }

      if (!instancesByFilm.has(filmId)) {
        instancesByFilm.set(filmId, []);
      }

      instancesByFilm.get(filmId).push({
        ...instance,
        filmId,
      });
    });

    // Sort instances within each film by rank (lower rank = better = sequence 1)
    instancesByFilm.forEach((filmInstances, filmId) => {
      filmInstances.sort((a, b) => a.rank - b.rank);
      filmInstances.forEach((instance, index) => {
        instance.sequenceNumber = index + 1;
      });
    });

    // Flatten back to array
    const instancesWithIds = Array.from(instancesByFilm.values()).flat();

    console.log(
      `   Found ${instancesWithIds.length} instances across ${instancesByFilm.size} films`
    );

    // Insert all instances
    const insertResult = await runningInstancesCollection.insertMany(instancesWithIds);
    console.log(`   ✓ Inserted ${insertResult.insertedCount} running instances\n`);

    // ========================================================================
    // PART 2: Create Sample Film Metadata
    // ========================================================================

    console.log('📚 Creating sample film metadata...');

    const sampleMetadata = [
      {
        filmId: filmMap.get('Mission: Impossible III|2006'),
        filmTitle: 'Mission: Impossible III',
        filmYear: 2006,
        trivia: [
          {
            category: 'stunts',
            fact: 'Tom Cruise performed his own stunts for the Shanghai rooftop chase scene, one of the most iconic running sequences in cinema.',
            source: 'Movies Films & Flix',
            verified: true,
          },
          {
            category: 'production',
            fact: 'Director J.J. Abrams commented "I loved watching you run" during filming of the #1 ranked running scene.',
            source: 'Movies Films & Flix Analysis',
            verified: true,
          },
          {
            category: 'production',
            fact: 'The famous running scene took 6-7 takes to get perfect, with a Spidercam rig built specifically for the scene.',
            source: 'Movies Films & Flix',
            verified: true,
          },
        ],
        runningAnalysis: {
          formBreakdown: {
            overallAnalysis:
              'Peak Tom Cruise running form. Elbows sharp, eyes forward, feet a blur. This film showcases the fastest Cruise has ever looked on screen.',
          },
          speedAnalysis:
            'Clocked at running 15.3 mph (24.6 km/h) during the famous running sequence at age 43.',
          comparisonToAthletes:
            'Running at speeds comparable to Olympic sprinters during action sequences.',
        },
      },
      {
        filmId: filmMap.get('Collateral|2004'),
        filmTitle: 'Collateral',
        filmYear: 2004,
        trivia: [
          {
            category: 'stunts',
            fact: 'The famous chair throw scene where Cruise wipes out was unplanned. Director Michael Mann kept it in the final cut for authenticity.',
            source: 'Movies Films & Flix',
            verified: true,
          },
          {
            category: 'production',
            fact: 'Ranked #2 overall for the window crash scene - one of the most realistic-looking stunts in the franchise.',
            source: 'Movies Films & Flix Ranking',
            verified: true,
          },
        ],
      },
      {
        filmId: filmMap.get('Vanilla Sky|2001'),
        filmTitle: 'Vanilla Sky',
        filmYear: 2001,
        trivia: [
          {
            category: 'production',
            fact: 'Times Square was closed for 3 hours on a Sunday morning in November for the iconic empty running scene.',
            source: 'Movies Films & Flix',
            verified: true,
          },
          {
            category: 'trivia',
            fact: "The empty Times Square scene symbolizes the character's fear of being alone, manifesting in his dreams.",
            source: 'Director Cameron Crowe',
            verified: true,
          },
        ],
      },
      {
        filmId: filmMap.get('The Firm|1993'),
        filmTitle: 'The Firm',
        filmYear: 1993,
        trivia: [
          {
            category: 'stunts',
            fact: "First film to fully showcase Tom Cruise's soon-to-be-famous running form (elbows and knees).",
            source: 'Movies Films & Flix',
            verified: true,
          },
        ],
        runningAnalysis: {
          formBreakdown: {
            overallAnalysis:
              'The film where the iconic Tom Cruise running style was first on full display.',
          },
        },
      },
      {
        filmId: filmMap.get('Risky Business|1983'),
        filmTitle: 'Risky Business',
        filmYear: 1983,
        trivia: [
          {
            category: 'trivia',
            fact: 'The 7-second cigarette-smoking running scene in sunglasses is described as "when Cruise became Tom Cruise".',
            source: 'Movies Films & Flix',
            verified: true,
          },
        ],
      },
      {
        filmId: filmMap.get('Mission: Impossible - Fallout|2018'),
        filmTitle: 'Mission: Impossible - Fallout',
        filmYear: 2018,
        trivia: [
          {
            category: 'stunts',
            fact: 'Tom Cruise broke his ankle during the rooftop running scene but continued filming. He said "I loved doing this, but it hurt."',
            source: 'Movies Films & Flix',
            verified: true,
          },
          {
            category: 'stunts',
            fact: 'The broken ankle happened at the very end of the famous rooftop jump scene. The moment is visible in the final film.',
            source: 'Behind the scenes footage',
            verified: true,
          },
        ],
      },
    ];

    const metadataToInsert = sampleMetadata.filter((m) => m.filmId);
    if (metadataToInsert.length > 0) {
      const metadataResult = await filmMetadataCollection.insertMany(metadataToInsert);
      console.log(`   ✓ Created ${metadataResult.insertedCount} film metadata entries\n`);
    }

    // ========================================================================
    // PART 3: Create Indexes
    // ========================================================================

    console.log('🔍 Creating indexes...');

    // Create indexes for runninginstances collection
    await runningInstancesCollection.createIndex({ filmId: 1 });
    await runningInstancesCollection.createIndex({ rank: 1 });
    await runningInstancesCollection.createIndex({ filmTitle: 1, filmYear: 1 });

    // Create indexes for filmmetadata collection
    await filmMetadataCollection.createIndex({ filmId: 1 }, { unique: true });

    console.log('   ✓ Indexes created\n');

    // ========================================================================
    // PART 4: Display Summary
    // ========================================================================

    console.log('📊 MongoDB Seed Summary:');
    console.log('   ═══════════════════════════════════════');

    const totalInstances = await runningInstancesCollection.countDocuments();
    const instancesWithTimestamps = await runningInstancesCollection.countDocuments({
      'scene.timestampStart': { $ne: null },
    });
    const instancesWithDistance = await runningInstancesCollection.countDocuments({
      'measurement.distanceFeet': { $ne: null },
    });
    const totalMetadata = await filmMetadataCollection.countDocuments();

    console.log(`   Running Instances: ${totalInstances}`);
    console.log(`   - With timestamps: ${instancesWithTimestamps}`);
    console.log(`   - With distance data: ${instancesWithDistance}`);
    console.log(`   - Awaiting manual entry: ${totalInstances - instancesWithDistance}`);
    console.log(`   Film Metadata Entries: ${totalMetadata}`);

    // Top 5 films by instance count
    const filmCounts = await runningInstancesCollection
      .aggregate([
        {
          $group: {
            _id: { filmTitle: '$filmTitle', filmYear: '$filmYear' },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ])
      .toArray();

    console.log(`\n   Top 5 Films by Running Instances:`);
    filmCounts.forEach((film, index) => {
      console.log(
        `   ${index + 1}. ${film._id.filmTitle} (${film._id.filmYear}): ${film.count} instances`
      );
    });

    // Tag distribution
    const tagCounts = await runningInstancesCollection
      .aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ])
      .toArray();

    console.log(`\n   Top Tags:`);
    tagCounts.forEach((tag, index) => {
      console.log(`   ${index + 1}. ${tag._id}: ${tag.count} instances`);
    });

    console.log('   ═══════════════════════════════════════');
    console.log('\n✨ MongoDB seeding complete!\n');

    console.log('📋 Next Steps:');
    console.log('   1. Review data in MongoDB Compass or similar tool');
    console.log('   2. Add distance measurements for instances with timestamps');
    console.log('   3. Expand filmMetadata for additional films');
    console.log('   4. Restart backend server to see running instances in UI');
    console.log('');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    throw error;
  } finally {
    await closeMongo();
  }
}

// Run seed
seedDatabase()
  .then(() => {
    console.log('Seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
