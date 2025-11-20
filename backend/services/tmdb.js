const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  console.error('❌ TMDB_API_KEY not found in environment variables');
  console.error('   Please add TMDB_API_KEY to your .env file');
  console.error('   Get your free API key at: https://www.themoviedb.org/settings/api');
  process.exit(1);
}

/**
 * Search for a movie by title and year
 * @param {string} title - Movie title
 * @param {number} year - Release year
 * @returns {Promise<object|null>} - Top search result or null if not found
 */
async function searchMovie(title, year) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: title,
        year: year,
      },
    });

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    }

    return null;
  } catch (error) {
    console.error(`Error searching for "${title}": ${error.message}`);
    return null;
  }
}

/**
 * Get detailed movie information by TMDB ID
 * @param {number} tmdbId - TMDB movie ID
 * @returns {Promise<object|null>} - Movie details or null if error
 */
async function getMovieDetails(tmdbId) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error getting details for TMDB ID ${tmdbId}: ${error.message}`);
    return null;
  }
}

/**
 * Add a delay to respect TMDB rate limits
 * TMDB allows ~40 requests per 10 seconds
 * @param {number} ms - Milliseconds to wait
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  searchMovie,
  getMovieDetails,
  delay,
};
