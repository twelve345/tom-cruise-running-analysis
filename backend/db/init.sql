-- Films table
CREATE TABLE IF NOT EXISTS films (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  runtime_minutes INTEGER,
  rotten_tomatoes_score INTEGER,
  total_running_distance_feet INTEGER DEFAULT 0,
  total_running_time_seconds DECIMAL(10, 2) DEFAULT 0,
  running_density DECIMAL(10, 4), -- feet per minute
  cpi_score DECIMAL(10, 4), -- Cruise Performance Index
  poster_url TEXT,
  imdb_id VARCHAR(20),
  tmdb_id INTEGER,
  rotten_tomatoes_url TEXT,
  wikipedia_url TEXT,
  youtube_trailer_url TEXT,
  letterboxd_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Running instances table
CREATE TABLE IF NOT EXISTS running_instances (
  id SERIAL PRIMARY KEY,
  film_id INTEGER REFERENCES films(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  distance_feet INTEGER NOT NULL,
  duration_seconds DECIMAL(10, 2) NOT NULL,
  timestamp_start VARCHAR(20), -- e.g., "01:23:45"
  context TEXT, -- description of the scene
  intensity VARCHAR(50), -- e.g., "sprint", "jog", "pursuit"
  location VARCHAR(255), -- indoor/outdoor, setting
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (for future authentication features)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_films_year ON films(year);
CREATE INDEX IF NOT EXISTS idx_films_cpi ON films(cpi_score DESC);
CREATE INDEX IF NOT EXISTS idx_running_instances_film_id ON running_instances(film_id);
CREATE INDEX IF NOT EXISTS idx_running_instances_distance ON running_instances(distance_feet DESC);

-- Function to calculate CPI (Cruise Performance Index)
-- CPI = (Running Distance in Feet) / (Runtime in Minutes) * (Tomatometer Score / 100)
CREATE OR REPLACE FUNCTION calculate_cpi(
  distance INTEGER,
  runtime INTEGER,
  score INTEGER
) RETURNS DECIMAL(10, 4) AS $$
BEGIN
  IF runtime = 0 OR score IS NULL THEN
    RETURN 0;
  END IF;
  RETURN (distance::DECIMAL / runtime::DECIMAL) * (score::DECIMAL / 100);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update film statistics when running instances change
CREATE OR REPLACE FUNCTION update_film_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE films
  SET
    total_running_distance_feet = (
      SELECT COALESCE(SUM(distance_feet), 0)
      FROM running_instances
      WHERE film_id = NEW.film_id
    ),
    total_running_time_seconds = (
      SELECT COALESCE(SUM(duration_seconds), 0)
      FROM running_instances
      WHERE film_id = NEW.film_id
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.film_id;

  -- Update running density (feet per minute)
  UPDATE films
  SET running_density = CASE
    WHEN runtime_minutes > 0 THEN total_running_distance_feet::DECIMAL / runtime_minutes::DECIMAL
    ELSE 0
  END,
  cpi_score = calculate_cpi(total_running_distance_feet, runtime_minutes, rotten_tomatoes_score)
  WHERE id = NEW.film_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS running_instance_stats_trigger ON running_instances;

CREATE TRIGGER running_instance_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON running_instances
FOR EACH ROW
EXECUTE FUNCTION update_film_stats();
