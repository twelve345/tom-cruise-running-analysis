/**
 * GraphQL Resolvers - Hybrid PostgreSQL + MongoDB Implementation
 *
 * PostgreSQL: Core relational data (films, aggregates, users)
 * MongoDB: Flexible document data (running instances, metadata)
 */

const pool = require('../db/postgres');
const { getMongoDB } = require('../db/mongodb');
const { ObjectId } = require('mongodb');

const resolvers = {
  // ============================================================================
  // POSTGRESQL QUERY RESOLVERS
  // ============================================================================

  // Film Queries
  films: async ({ filter, sortBy = 'year', sortOrder = 'DESC', limit = 100, offset = 0 }) => {
    let query = 'SELECT * FROM films WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Apply filters
    if (filter) {
      if (filter.minYear) {
        query += ` AND year >= $${paramIndex++}`;
        params.push(filter.minYear);
      }
      if (filter.maxYear) {
        query += ` AND year <= $${paramIndex++}`;
        params.push(filter.maxYear);
      }
      if (filter.minDistance) {
        query += ` AND total_running_distance_feet >= $${paramIndex++}`;
        params.push(filter.minDistance);
      }
      if (filter.maxDistance) {
        query += ` AND total_running_distance_feet <= $${paramIndex++}`;
        params.push(filter.maxDistance);
      }
      if (filter.minCpi) {
        query += ` AND cpi_score >= $${paramIndex++}`;
        params.push(filter.minCpi);
      }
      if (filter.maxCpi) {
        query += ` AND cpi_score <= $${paramIndex++}`;
        params.push(filter.maxCpi);
      }
      if (filter.minRottenTomatoes) {
        query += ` AND rotten_tomatoes_score >= $${paramIndex++}`;
        params.push(filter.minRottenTomatoes);
      }
    }

    // Apply sorting
    const sortFieldMap = {
      year: 'year',
      title: 'title',
      runtimeMinutes: 'runtime_minutes',
      totalRunningDistanceFeet: 'total_running_distance_feet',
      cpiScore: 'cpi_score',
      rottenTomatoesScore: 'rotten_tomatoes_score',
    };

    // Special handling for runningInstancesCount (computed from MongoDB)
    if (sortBy === 'runningInstancesCount') {
      // Fetch all films without pagination
      const result = await pool.query(query, params);
      const films = result.rows.map(mapFilmRow);

      // Augment with MongoDB counts
      const db = getMongoDB();
      const filmsWithCounts = await Promise.all(
        films.map(async (film) => {
          const count = await db.collection('runninginstances').countDocuments({ filmId: film.id });
          return { ...film, _instanceCount: count };
        })
      );

      // Sort by instance count
      filmsWithCounts.sort((a, b) => {
        if (sortOrder === 'ASC') {
          return a._instanceCount - b._instanceCount;
        } else {
          return b._instanceCount - a._instanceCount;
        }
      });

      // Apply pagination
      const paginatedFilms = filmsWithCounts.slice(offset, offset + limit);
      return paginatedFilms;
    }

    query += ` ORDER BY ${sortFieldMap[sortBy] || 'year'} ${sortOrder}`;

    // Apply pagination
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows.map(mapFilmRow);
  },

  film: async ({ id }) => {
    const result = await pool.query('SELECT * FROM films WHERE id = $1', [id]);
    return result.rows[0] ? mapFilmRow(result.rows[0]) : null;
  },

  filmByTitle: async ({ title }) => {
    const result = await pool.query('SELECT * FROM films WHERE LOWER(title) = LOWER($1)', [title]);
    return result.rows[0] ? mapFilmRow(result.rows[0]) : null;
  },

  // Statistics Queries
  filmStats: async () => {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int as total_films,
        SUM(total_running_distance_feet)::int as total_distance_feet,
        SUM(total_running_time_seconds) as total_running_time_seconds,
        AVG(total_running_distance_feet) as average_distance_per_film
      FROM films
    `);

    const stats = result.rows[0];
    return {
      totalFilms: stats.total_films,
      totalDistanceFeet: stats.total_distance_feet || 0,
      totalRunningTimeSeconds: parseFloat(stats.total_running_time_seconds) || 0,
      averageDistancePerFilm: parseFloat(stats.average_distance_per_film) || 0,
      careerMiles: (stats.total_distance_feet || 0) / 5280,
    };
  },

  yearlyStats: async () => {
    const result = await pool.query(`
      SELECT
        year,
        SUM(total_running_distance_feet)::int as total_distance_feet,
        COUNT(*)::int as film_count
      FROM films
      GROUP BY year
      ORDER BY year
    `);

    return result.rows.map((row) => ({
      year: row.year,
      totalDistanceFeet: row.total_distance_feet || 0,
      filmCount: row.film_count,
      films: async () => {
        const filmResult = await pool.query('SELECT * FROM films WHERE year = $1', [row.year]);
        return filmResult.rows.map(mapFilmRow);
      },
    }));
  },

  topRunningFilms: async ({ limit = 10 }) => {
    const result = await pool.query(
      `
      SELECT * FROM films
      WHERE total_running_distance_feet > 0
      ORDER BY total_running_distance_feet DESC
      LIMIT $1
    `,
      [limit]
    );
    return result.rows.map(mapFilmRow);
  },

  topCpiFilms: async ({ limit = 10 }) => {
    const result = await pool.query(
      `
      SELECT * FROM films
      WHERE cpi_score IS NOT NULL
      ORDER BY cpi_score DESC
      LIMIT $1
    `,
      [limit]
    );
    return result.rows.map(mapFilmRow);
  },

  // User Queries
  user: async ({ id }) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  },

  users: async () => {
    const result = await pool.query('SELECT * FROM users');
    return result.rows.map(mapUserRow);
  },

  // ============================================================================
  // MONGODB QUERY RESOLVERS
  // ============================================================================

  // Running Instances (MongoDB)
  runningInstances: async ({ filmId, intensity, tags, limit = 100, offset = 0 }) => {
    const db = getMongoDB();
    const query = {};

    if (filmId) query.filmId = filmId;
    if (intensity) query['scene.intensity'] = intensity;
    if (tags && tags.length > 0) query.tags = { $in: tags };

    const instances = await db
      .collection('runninginstances')
      .find(query)
      .sort({ rank: 1 })
      .limit(limit)
      .skip(offset)
      .toArray();

    return instances.map(mapMongoRunningInstance);
  },

  runningInstance: async ({ id }) => {
    const db = getMongoDB();
    const instance = await db.collection('runninginstances').findOne({ _id: new ObjectId(id) });
    return instance ? mapMongoRunningInstance(instance) : null;
  },

  runningInstanceByRank: async ({ rank }) => {
    const db = getMongoDB();
    const instance = await db.collection('runninginstances').findOne({ rank });
    return instance ? mapMongoRunningInstance(instance) : null;
  },

  searchRunningScenes: async ({ query }) => {
    const db = getMongoDB();
    const instances = await db
      .collection('runninginstances')
      .find({ $text: { $search: query } })
      .limit(50)
      .toArray();
    return instances.map(mapMongoRunningInstance);
  },

  // Film Metadata (MongoDB)
  filmMetadata: async ({ filmId }) => {
    const db = getMongoDB();
    const metadata = await db.collection('filmmetadata').findOne({ filmId });
    return metadata ? mapMongoFilmMetadata(metadata) : null;
  },

  allFilmMetadata: async () => {
    const db = getMongoDB();
    const metadata = await db.collection('filmmetadata').find().toArray();
    return metadata.map(mapMongoFilmMetadata);
  },

  // Hybrid Queries (PostgreSQL + MongoDB)
  filmWithScenes: async ({ id }) => {
    // Get film from PostgreSQL
    const filmResult = await pool.query('SELECT * FROM films WHERE id = $1', [id]);
    if (!filmResult.rows[0]) return null;

    const film = mapFilmRow(filmResult.rows[0]);

    // Get instances from MongoDB
    const db = getMongoDB();
    const instances = await db
      .collection('runninginstances')
      .find({ filmId: parseInt(id) })
      .sort({ rank: 1 })
      .toArray();

    // Get metadata from MongoDB
    const metadata = await db.collection('filmmetadata').findOne({ filmId: parseInt(id) });

    return {
      film,
      instances: instances.map(mapMongoRunningInstance),
      metadata: metadata ? mapMongoFilmMetadata(metadata) : null,
    };
  },

  topFilmsByIntensity: async ({ intensity, limit = 10 }) => {
    // Get film IDs that have instances with this intensity
    const db = getMongoDB();
    const instances = await db
      .collection('runninginstances')
      .aggregate([
        { $match: { 'scene.intensity': intensity } },
        { $group: { _id: '$filmId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
      ])
      .toArray();

    const filmIds = instances.map((i) => i._id);

    // Get films from PostgreSQL
    const result = await pool.query(
      'SELECT * FROM films WHERE id = ANY($1) ORDER BY total_running_distance_feet DESC',
      [filmIds]
    );

    return result.rows.map(mapFilmRow);
  },

  // ============================================================================
  // MUTATION RESOLVERS
  // ============================================================================

  // Film Mutations
  createFilm: async ({ title, year, runtimeMinutes, rottenTomatoesScore, posterUrl, imdbId }) => {
    const result = await pool.query(
      `INSERT INTO films (title, year, runtime_minutes, rotten_tomatoes_score, poster_url, imdb_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, year, runtimeMinutes, rottenTomatoesScore, posterUrl, imdbId]
    );
    return mapFilmRow(result.rows[0]);
  },

  updateFilm: async ({
    id,
    title,
    year,
    runtimeMinutes,
    rottenTomatoesScore,
    posterUrl,
    imdbId,
  }) => {
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      params.push(title);
    }
    if (year !== undefined) {
      updates.push(`year = $${paramIndex++}`);
      params.push(year);
    }
    if (runtimeMinutes !== undefined) {
      updates.push(`runtime_minutes = $${paramIndex++}`);
      params.push(runtimeMinutes);
    }
    if (rottenTomatoesScore !== undefined) {
      updates.push(`rotten_tomatoes_score = $${paramIndex++}`);
      params.push(rottenTomatoesScore);
    }
    if (posterUrl !== undefined) {
      updates.push(`poster_url = $${paramIndex++}`);
      params.push(posterUrl);
    }
    if (imdbId !== undefined) {
      updates.push(`imdb_id = $${paramIndex++}`);
      params.push(imdbId);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `UPDATE films SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, params);
    return mapFilmRow(result.rows[0]);
  },

  deleteFilm: async ({ id }) => {
    await pool.query('DELETE FROM films WHERE id = $1', [id]);
    return true;
  },

  // Running Instance Mutations (kept for backward compatibility, but MongoDB is primary)
  createRunningInstance: async ({
    filmId,
    sequenceNumber,
    distanceFeet,
    durationSeconds,
    timestampStart,
    context,
    intensity,
    location,
  }) => {
    const result = await pool.query(
      `INSERT INTO running_instances
       (film_id, sequence_number, distance_feet, duration_seconds, timestamp_start, context, intensity, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        filmId,
        sequenceNumber,
        distanceFeet,
        durationSeconds,
        timestampStart,
        context,
        intensity,
        location,
      ]
    );
    return mapRunningInstanceRow(result.rows[0]);
  },

  updateRunningInstance: async ({
    id,
    distanceFeet,
    durationSeconds,
    timestampStart,
    context,
    intensity,
    location,
  }) => {
    // Update in MongoDB if it's a MongoDB document
    try {
      const db = getMongoDB();
      const updateFields = {};
      if (distanceFeet !== undefined) updateFields['measurement.distanceFeet'] = distanceFeet;
      if (durationSeconds !== undefined)
        updateFields['measurement.durationSeconds'] = durationSeconds;
      if (timestampStart !== undefined) updateFields['scene.timestampStart'] = timestampStart;
      if (context !== undefined) updateFields['scene.context'] = context;
      if (intensity !== undefined) updateFields['scene.intensity'] = intensity;
      if (location !== undefined) updateFields['scene.location.setting'] = location;

      const result = await db
        .collection('runninginstances')
        .findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateFields },
          { returnDocument: 'after' }
        );

      if (result.value) {
        return mapMongoRunningInstance(result.value);
      }
    } catch (err) {
      // Not a MongoDB ObjectId, try PostgreSQL
    }

    // Otherwise update in PostgreSQL
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (distanceFeet !== undefined) {
      updates.push(`distance_feet = $${paramIndex++}`);
      params.push(distanceFeet);
    }
    if (durationSeconds !== undefined) {
      updates.push(`duration_seconds = $${paramIndex++}`);
      params.push(durationSeconds);
    }
    if (timestampStart !== undefined) {
      updates.push(`timestamp_start = $${paramIndex++}`);
      params.push(timestampStart);
    }
    if (context !== undefined) {
      updates.push(`context = $${paramIndex++}`);
      params.push(context);
    }
    if (intensity !== undefined) {
      updates.push(`intensity = $${paramIndex++}`);
      params.push(intensity);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      params.push(location);
    }

    params.push(id);
    const query = `UPDATE running_instances SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, params);
    return mapRunningInstanceRow(result.rows[0]);
  },

  deleteRunningInstance: async ({ id }) => {
    await pool.query('DELETE FROM running_instances WHERE id = $1', [id]);
    return true;
  },

  // User Mutations
  createUser: async ({ username, email, password }) => {
    // Hash password in production!
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [username, email, password]
    );
    return mapUserRow(result.rows[0]);
  },
};

// ============================================================================
// HELPER FUNCTIONS - PostgreSQL Mappers
// ============================================================================

function mapFilmRow(row) {
  return {
    id: row.id,
    title: row.title,
    year: row.year,
    runtimeMinutes: row.runtime_minutes,
    rottenTomatoesScore: row.rotten_tomatoes_score,
    totalRunningDistanceFeet: row.total_running_distance_feet || 0,
    totalRunningTimeSeconds: parseFloat(row.total_running_time_seconds) || 0,
    runningInstancesCount: async () => {
      const db = getMongoDB();
      return await db.collection('runninginstances').countDocuments({ filmId: row.id });
    },
    runningDensity: row.running_density ? parseFloat(row.running_density) : null,
    cpiScore: row.cpi_score ? parseFloat(row.cpi_score) : null,
    posterUrl: row.poster_url,
    imdbId: row.imdb_id,
    tmdbId: row.tmdb_id,
    rottenTomatoesUrl: row.rotten_tomatoes_url,
    wikipediaUrl: row.wikipedia_url,
    youtubeTrailerUrl: row.youtube_trailer_url,
    letterboxdUrl: row.letterboxd_url,
    // Use MongoDB for running instances
    runningInstances: async () => {
      const db = getMongoDB();
      const instances = await db
        .collection('runninginstances')
        .find({ filmId: row.id })
        .sort({ rank: 1 })
        .toArray();
      return instances.map(mapMongoRunningInstance);
    },
    // Use MongoDB for film metadata
    metadata: async () => {
      const db = getMongoDB();
      const metadata = await db.collection('filmmetadata').findOne({ filmId: row.id });
      return metadata ? mapMongoFilmMetadata(metadata) : null;
    },
    // Data provenance
    dataSources: () => ({
      metadata: {
        provider: 'TMDB',
        url: 'https://www.themoviedb.org',
        retrievedAt: row.created_at?.toISOString(),
        methodology: null,
      },
      runningDistance: {
        provider: 'Rotten Tomatoes',
        url: 'https://editorial.rottentomatoes.com/article/the-more-tom-cruise-runs-the-better-his-movies-are/',
        methodology: '14.6 feet/second (6-minute mile pace)',
      },
      poster: {
        provider: 'TMDB',
        url: 'https://www.themoviedb.org',
      },
    }),
    createdAt: row.created_at?.toISOString(),
    updatedAt: row.updated_at?.toISOString(),
  };
}

function mapRunningInstanceRow(row) {
  return {
    id: row.id,
    filmId: row.film_id,
    film: async () => {
      const result = await pool.query('SELECT * FROM films WHERE id = $1', [row.film_id]);
      return result.rows[0] ? mapFilmRow(result.rows[0]) : null;
    },
    sequenceNumber: row.sequence_number,
    distanceFeet: row.distance_feet,
    durationSeconds: parseFloat(row.duration_seconds),
    timestampStart: row.timestamp_start,
    context: row.context,
    intensity: row.intensity,
    location: row.location,
    createdAt: row.created_at?.toISOString(),
  };
}

function mapUserRow(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    createdAt: row.created_at?.toISOString(),
    lastLogin: row.last_login?.toISOString(),
  };
}

// ============================================================================
// HELPER FUNCTIONS - MongoDB Mappers
// ============================================================================

function mapMongoRunningInstance(doc) {
  return {
    id: doc._id.toString(),
    filmId: doc.filmId,
    filmTitle: doc.filmTitle,
    filmYear: doc.filmYear,
    rank: doc.rank,
    sequenceNumber: doc.sequenceNumber,
    scene: {
      context: doc.scene.context,
      timestampStart: doc.scene.timestampStart,
      timestampEnd: doc.scene.timestampEnd,
      intensity: doc.scene.intensity,
      location: doc.scene.location,
    },
    measurement: doc.measurement
      ? {
          distanceFeet: doc.measurement.distanceFeet,
          durationSeconds: doc.measurement.durationSeconds,
          calculatedBy: doc.measurement.calculatedBy,
          confidence: doc.measurement.confidence,
          source: doc.measurement.source,
          calculatedAt: doc.measurement.calculatedAt?.toISOString(),
        }
      : null,
    media: doc.media
      ? {
          youtubeUrl: doc.media.youtubeUrl,
          youtubeTimestamp: doc.media.youtubeTimestamp,
          clips: doc.media.clips || [],
          screenshots: doc.media.screenshots || [],
        }
      : null,
    metadata: doc.metadata
      ? {
          director: doc.metadata.director,
          cinematographer: doc.metadata.cinematographer,
          stunts: doc.metadata.stunts,
          behindTheScenes: doc.metadata.behindTheScenes,
          directorQuotes: doc.metadata.directorQuotes || [],
        }
      : null,
    tags: doc.tags || [],
    sources: doc.sources,
    // Resolve film from PostgreSQL
    film: async () => {
      const result = await pool.query('SELECT * FROM films WHERE id = $1', [doc.filmId]);
      return result.rows[0] ? mapFilmRow(result.rows[0]) : null;
    },
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

function mapMongoFilmMetadata(doc) {
  return {
    id: doc._id.toString(),
    filmId: doc.filmId,
    filmTitle: doc.filmTitle,
    filmYear: doc.filmYear,
    trivia: doc.trivia || [],
    runningAnalysis: doc.runningAnalysis || null,
    behindTheScenes: doc.behindTheScenes || [],
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

module.exports = resolvers;
