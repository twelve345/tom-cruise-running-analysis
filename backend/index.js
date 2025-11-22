require('dotenv').config();
const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');
const cors = require('cors');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const { connectMongo } = require('./db/mongodb');
const pool = require('./db/postgres');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://tomcruiserunningtime.com',
  'https://www.tomcruiserunningtime.com',
  'https://tomcruise-frontend-production.up.railway.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.log('🚫 Blocked by CORS. Origin:', origin);
      console.log('   Allowed Origins:', allowedOrigins);
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  // allowedHeaders: ['Content-Type', 'Authorization'] // Removed to allow all headers requested by browser/Apollo
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Explicitly handle OPTIONS preflight requests for all routes
app.options('*', cors(corsOptions));

app.use(express.json());

// ... (health check code remains same)

// GraphQL endpoint - Handles actual GraphQL queries
// IMPORTANT: Only handle GET and POST. Do NOT use app.all() or app.use() without method restriction,
// otherwise OPTIONS requests might fall through to graphql-http and cause 502s.
const graphqlHandler = createHandler({
  schema: schema,
  rootValue: resolvers,
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      locations: error.locations,
      path: error.path,
    };
  },
});

app.get('/graphql', graphqlHandler);
app.post('/graphql', graphqlHandler);

// Explicitly handle OPTIONS on /graphql to ensure 200 OK (redundant with app.options but safe)
app.options('/graphql', (req, res) => {
  res.sendStatus(200);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Tom Cruise Running Analysis API',
    version: '1.0.0',
    endpoints: {
      graphql: '/graphql',
      health: '/health',
      graphiql: process.env.NODE_ENV !== 'production' ? '/graphiql' : 'disabled',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, _next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV !== 'production' ? err.message : undefined,
  });
});

// Initialize connections and start server
async function startServer() {
  try {
    console.log('🚀 Starting Tom Cruise Running Analysis API...\n');

    // Test PostgreSQL connection
    console.log('📊 Connecting to PostgreSQL...');
    await pool.query('SELECT NOW()');
    console.log('✓ PostgreSQL connected successfully\n');

    // Connect to MongoDB (optional, for future features)
    try {
      console.log('🍃 Connecting to MongoDB...');
      await connectMongo();
      console.log('✓ MongoDB connected successfully\n');
    } catch (mongoError) {
      console.warn('⚠️  MongoDB connection failed (optional service):', mongoError.message);
      console.warn('   The API will work without MongoDB for now.\n');
    }

    // Start the Express server
    app.listen(PORT, () => {
      console.log('════════════════════════════════════════════════════');
      console.log(`🎬 Server running on http://localhost:${PORT}`);
      console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
      console.log('════════════════════════════════════════════════════\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Start the server
startServer();
