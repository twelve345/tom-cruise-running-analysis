#!/bin/sh
# === DIAGNOSTIC VERSION - Remove extra logging after debugging ===

echo "=== STARTUP.SH BEGINNING ==="
echo "Time: $(date)"
echo "DATABASE_URL exists: $([ -n "$DATABASE_URL" ] && echo 'yes' || echo 'NO!')"
echo "NODE_ENV: $NODE_ENV"

# Wait for database to be ready (with timeout)
echo "⏳ Waiting for database connection (max 30 seconds)..."
COUNTER=0
MAX_WAIT=30

until node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT 1')
  .then(() => { console.log('DB OK'); process.exit(0); })
  .catch((e) => { console.error('DB Error:', e.message); process.exit(1); });
"; do
  COUNTER=$((COUNTER + 2))
  if [ $COUNTER -ge $MAX_WAIT ]; then
    echo "WARNING: Database not available after ${MAX_WAIT}s"
    echo "Continuing anyway to start server..."
    break
  fi
  echo "   Waiting... ($COUNTER/${MAX_WAIT}s)"
  sleep 2
done

echo "✓ Database check complete"

# Check if tables exist
echo "🔍 Checking database schema..."
TABLE_EXISTS=$(node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query(\"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'films')\")
  .then(result => { console.log(result.rows[0].exists); process.exit(0); })
  .catch((e) => { console.error('Schema check error:', e.message); console.log('false'); process.exit(0); });
")

echo "TABLE_EXISTS result: '$TABLE_EXISTS'"

if [ "$TABLE_EXISTS" = "false" ]; then
  echo "📋 Tables not found. Running initial schema setup..."
  node scripts/initDb.js || echo "WARNING: initDb.js failed"
  echo "✓ Schema initialization attempted"
else
  echo "✓ Tables already exist"
fi

# Run migrations
echo "🔄 Running database migrations..."
node scripts/migrate.js || echo "WARNING: migrate.js failed"
echo "✓ Migrations attempted"

echo "=== STARTUP.SH COMPLETE ==="
echo "Now starting node index.js..."
