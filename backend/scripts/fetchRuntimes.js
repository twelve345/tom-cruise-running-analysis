require('dotenv').config();
const { searchMovie, getMovieDetails, delay } = require('../services/tmdb');
const fs = require('fs');
const path = require('path');

// Movie data from seedDb.js
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

async function fetchRuntimes() {
  console.log('🎬 Fetching film data from TMDB...\n');
  console.log(`Total films to process: ${movieData.length}\n`);

  const enrichedData = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < movieData.length; i++) {
    const movie = movieData[i];
    const progress = `[${i + 1}/${movieData.length}]`;

    console.log(`${progress} ${movie.title} (${movie.year})`);

    try {
      // Search for the movie
      const searchResult = await searchMovie(movie.title, movie.year);

      if (!searchResult) {
        console.log(`  ⚠️  Not found on TMDB`);
        enrichedData.push({
          ...movie,
          runtime: null,
          imdb_id: null,
          tmdb_id: null,
          poster_url: null,
        });
        failureCount++;
        await delay(300); // Rate limiting
        continue;
      }

      // Get detailed information
      const details = await getMovieDetails(searchResult.id);

      if (!details) {
        console.log(`  ⚠️  Failed to get details`);
        enrichedData.push({
          ...movie,
          runtime: null,
          imdb_id: null,
          tmdb_id: searchResult.id,
          poster_url: null,
        });
        failureCount++;
        await delay(300);
        continue;
      }

      // Build enriched data
      const enriched = {
        ...movie,
        runtime: details.runtime,
        imdb_id: details.imdb_id,
        tmdb_id: details.id,
        poster_url: details.poster_path
          ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
          : null,
      };

      enrichedData.push(enriched);
      successCount++;

      console.log(`  ✓ Runtime: ${details.runtime} min | IMDB: ${details.imdb_id}`);
      console.log(`  ✓ Poster: ${enriched.poster_url ? 'Found' : 'N/A'}`);

      // Rate limiting: ~300ms between requests (safe for TMDB's ~40/10s limit)
      await delay(300);
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      enrichedData.push({
        ...movie,
        runtime: null,
        imdb_id: null,
        tmdb_id: null,
        poster_url: null,
      });
      failureCount++;
      await delay(300);
    }
  }

  // Save to JSON file
  const outputPath = path.join(__dirname, 'enrichedMovieData.json');
  fs.writeFileSync(outputPath, JSON.stringify(enrichedData, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log('✅ Data enrichment complete!');
  console.log('='.repeat(50));
  console.log(`📊 Success: ${successCount}/${movieData.length} films`);
  console.log(`⚠️  Failed: ${failureCount}/${movieData.length} films`);
  console.log(`💾 Saved to: ${outputPath}`);
  console.log('\n📋 Next steps:');
  console.log('   1. Review enrichedMovieData.json for any issues');
  console.log('   2. Run migration: node scripts/migrations/002_update_runtimes.js');
  console.log('   3. Update seedDb.js with the new data');
}

// Run the script
fetchRuntimes()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
