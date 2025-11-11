require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../db/postgres');

async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '../db/init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    await pool.query(sql);

    console.log('✅ Database tables created successfully!');
    console.log('   - films');
    console.log('   - running_instances');
    console.log('   - users');
    console.log('   - indexes and triggers\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    await pool.end();
    process.exit(1);
  }
}

initializeDatabase();
