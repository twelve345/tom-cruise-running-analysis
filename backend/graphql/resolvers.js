const pool = require('../db/postgres');
// const { getMongoDB } = require('../db/mongodb'); // TODO: Will be used for future MongoDB operations

const resolvers = {
  // ============================================
  // QUERY RESOLVERS
  // ============================================

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
      totalRunningDistanceFeet: 'total_running_distance_feet',
      cpiScore: 'cpi_score',
      rottenTomatoesScore: 'rotten_tomatoes_score'
    };
    query += ` ORDER BY ${sortFieldMap[sortBy] || 'year'} ${sortOrder}`;

    // Apply pagination
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows.map(row => mapFilmRow(row));
  },

  film: async ({ id }) => {
    const result = await pool.query('SELECT * FROM films WHERE id = $1', [id]);
    return result.rows[0] ? mapFilmRow(result.rows[0]) : null;
  },

  filmByTitle: async ({ title }) => {
    const result = await pool.query('SELECT * FROM films WHERE LOWER(title) = LOWER($1)', [title]);
    return result.rows[0] ? mapFilmRow(result.rows[0]) : null;
  },

  // Running Instance Queries
  runningInstances: async ({ filter, limit = 100, offset = 0 }) => {
    let query = 'SELECT * FROM running_instances WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filter) {
      if (filter.filmId) {
        query += ` AND film_id = $${paramIndex++}`;
        params.push(filter.filmId);
      }
      if (filter.minDistance) {
        query += ` AND distance_feet >= $${paramIndex++}`;
        params.push(filter.minDistance);
      }
      if (filter.maxDistance) {
        query += ` AND distance_feet <= $${paramIndex++}`;
        params.push(filter.maxDistance);
      }
      if (filter.intensity) {
        query += ` AND LOWER(intensity) = LOWER($${paramIndex++})`;
        params.push(filter.intensity);
      }
    }

    query += ` ORDER BY film_id, sequence_number LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows.map(row => mapRunningInstanceRow(row));
  },

  runningInstance: async ({ id }) => {
    const result = await pool.query('SELECT * FROM running_instances WHERE id = $1', [id]);
    return result.rows[0] ? mapRunningInstanceRow(result.rows[0]) : null;
  },

  // Statistics Queries
  filmStats: async () => {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_films,
        COALESCE(SUM(total_running_distance_feet), 0) as total_distance_feet,
        COALESCE(SUM(total_running_time_seconds), 0) as total_running_time_seconds,
        COALESCE(SUM(running_instances_count), 0) as total_running_instances,
        COALESCE(AVG(total_running_distance_feet), 0) as average_distance_per_film
      FROM films
    `);

    const stats = result.rows[0];
    return {
      totalFilms: parseInt(stats.total_films),
      totalDistanceFeet: parseInt(stats.total_distance_feet),
      totalRunningTimeSeconds: parseFloat(stats.total_running_time_seconds),
      totalRunningInstances: parseInt(stats.total_running_instances),
      averageDistancePerFilm: parseFloat(stats.average_distance_per_film),
      careerMiles: parseFloat(stats.total_distance_feet) / 5280 // Convert feet to miles
    };
  },

  yearlyStats: async () => {
    const result = await pool.query(`
      SELECT
        year,
        SUM(total_running_distance_feet) as total_distance_feet,
        COUNT(*) as film_count
      FROM films
      GROUP BY year
      ORDER BY year
    `);

    return Promise.all(result.rows.map(async (row) => {
      const filmsResult = await pool.query('SELECT * FROM films WHERE year = $1', [row.year]);
      return {
        year: row.year,
        totalDistanceFeet: parseInt(row.total_distance_feet),
        filmCount: parseInt(row.film_count),
        films: filmsResult.rows.map(mapFilmRow)
      };
    }));
  },

  topRunningFilms: async ({ limit = 10 }) => {
    const result = await pool.query(
      'SELECT * FROM films ORDER BY total_running_distance_feet DESC LIMIT $1',
      [limit]
    );
    return result.rows.map(row => mapFilmRow(row));
  },

  topCpiFilms: async ({ limit = 10 }) => {
    const result = await pool.query(
      'SELECT * FROM films ORDER BY cpi_score DESC NULLS LAST LIMIT $1',
      [limit]
    );
    return result.rows.map(row => mapFilmRow(row));
  },

  // User Queries
  user: async ({ id }) => {
    const result = await pool.query('SELECT id, username, email, created_at, last_login FROM users WHERE id = $1', [id]);
    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  },

  users: async () => {
    const result = await pool.query('SELECT id, username, email, created_at, last_login FROM users');
    return result.rows.map(row => mapUserRow(row));
  },

  // ============================================
  // MUTATION RESOLVERS
  // ============================================

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

  updateFilm: async ({ id, title, year, runtimeMinutes, rottenTomatoesScore, posterUrl, imdbId }) => {
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

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const result = await pool.query(
      `UPDATE films SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw new Error('Film not found');
    }

    return mapFilmRow(result.rows[0]);
  },

  deleteFilm: async ({ id }) => {
    const result = await pool.query('DELETE FROM films WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  },

  // Running Instance Mutations
  createRunningInstance: async ({
    filmId,
    sequenceNumber,
    distanceFeet,
    durationSeconds,
    timestampStart,
    context,
    intensity,
    location
  }) => {
    const result = await pool.query(
      `INSERT INTO running_instances
       (film_id, sequence_number, distance_feet, duration_seconds, timestamp_start, context, intensity, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [filmId, sequenceNumber, distanceFeet, durationSeconds, timestampStart, context, intensity, location]
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
    location
  }) => {
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

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(id);

    const result = await pool.query(
      `UPDATE running_instances SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw new Error('Running instance not found');
    }

    return mapRunningInstanceRow(result.rows[0]);
  },

  deleteRunningInstance: async ({ id }) => {
    const result = await pool.query('DELETE FROM running_instances WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  },

  // User Mutations
  createUser: async ({ username, email, password }) => {
    // In production, you should hash the password with bcrypt
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, password] // Note: password should be hashed in production
    );
    return mapUserRow(result.rows[0]);
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function mapFilmRow(row) {
  return {
    id: row.id,
    title: row.title,
    year: row.year,
    runtimeMinutes: row.runtime_minutes,
    rottenTomatoesScore: row.rotten_tomatoes_score,
    totalRunningDistanceFeet: row.total_running_distance_feet || 0,
    totalRunningTimeSeconds: parseFloat(row.total_running_time_seconds) || 0,
    runningInstancesCount: row.running_instances_count || 0,
    runningDensity: row.running_density ? parseFloat(row.running_density) : null,
    cpiScore: row.cpi_score ? parseFloat(row.cpi_score) : null,
    posterUrl: row.poster_url,
    imdbId: row.imdb_id,
    runningInstances: async () => {
      const result = await pool.query(
        'SELECT * FROM running_instances WHERE film_id = $1 ORDER BY sequence_number',
        [row.id]
      );
      return result.rows.map(mapRunningInstanceRow);
    },
    createdAt: row.created_at?.toISOString(),
    updatedAt: row.updated_at?.toISOString()
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
    createdAt: row.created_at?.toISOString()
  };
}

function mapUserRow(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    createdAt: row.created_at?.toISOString(),
    lastLogin: row.last_login?.toISOString()
  };
}

module.exports = resolvers;
