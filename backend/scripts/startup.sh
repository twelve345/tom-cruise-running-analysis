#!/bin/bash
set -e

echo "🚀 Starting Railway deployment initialization..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT 1')
  .then(() => { console.log('✓ Database connected'); process.exit(0); })
  .catch(() => process.exit(1));
" 2>/dev/null; do
  echo "   Database not ready, waiting 2s..."
  sleep 2
done

# Check if tables exist
echo "🔍 Checking database schema..."
TABLE_EXISTS=$(node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query(\"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'films')\")
  .then(result => { console.log(result.rows[0].exists); process.exit(0); })
  .catch(() => { console.log('false'); process.exit(0); });
" 2>/dev/null)

if [ "$TABLE_EXISTS" = "false" ]; then
  echo "📋 Tables not found. Running initial schema setup..."
  node scripts/initDb.js
  echo "✓ Schema initialized"
else
  echo "✓ Tables already exist"
fi

# Run migrations
echo "🔄 Running database migrations..."
node scripts/migrate.js
echo "✓ Migrations complete"

echo "✨ Database initialization complete!"
echo ""
echo "📝 Note: To seed the database with film data, run:"
echo "   railway run npm run db:seed --workspace=backend"
echo ""
