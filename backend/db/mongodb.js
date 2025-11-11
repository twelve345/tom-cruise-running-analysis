const { MongoClient } = require('mongodb');

let client;
let db;

async function connectMongo() {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    db = client.db();
    console.log('✓ Connected to MongoDB database');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

function getMongoDB() {
  if (!db) {
    throw new Error('MongoDB not initialized. Call connectMongo() first.');
  }
  return db;
}

async function closeMongo() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

module.exports = {
  connectMongo,
  getMongoDB,
  closeMongo
};
