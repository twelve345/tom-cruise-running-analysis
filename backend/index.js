// === DIAGNOSTIC LOGGING - REMOVE AFTER DEBUGGING ===
console.log('=== BACKEND STARTUP ===');
console.log('Time:', new Date().toISOString());
console.log('Node version:', process.version);
console.log('PORT env:', process.env.PORT);
console.log('MONGO_URL exists:', !!process.env.MONGO_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('=======================');

process.on('uncaughtException', (err) => {
  console.error('=== UNCAUGHT EXCEPTION ===');
  console.error(err);
  console.error('==========================');
});

process.on('unhandledRejection', (reason) => {
  console.error('=== UNHANDLED REJECTION ===');
  console.error('Reason:', reason);
  console.error('===========================');
});
// === END DIAGNOSTIC LOGGING ===

require('dotenv').config();
const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');
const cors = require('cors');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const { connectMongo, getMongoDB, closeMongo } = require('./db/mongodb');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
const _allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://tomcruiserunningtime.com',
  'https://www.tomcruiserunningtime.com',
  'https://tomcruise-frontend-production.up.railway.app',
];

// Global Request Logger - Debugging Production Issues
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('   Headers Origin:', req.headers.origin);
  next();
});

const corsOptions = {
  origin: function (origin, callback) {
    // NUCLEAR OPTION: Allow ALL origins to rule out logic errors.
    // We will restrict this back to 'allowedOrigins' once we confirm it works.
    console.log('✅ CORS Allowed (Debug Mode). Origin:', origin);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  // allowedHeaders: ['Content-Type', 'Authorization'] // Removed to allow all headers
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Explicitly handle OPTIONS preflight requests for all routes
app.options('*', cors(corsOptions));

app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  let mongoStatus;

  try {
    await getMongoDB().command({ ping: 1 });
    mongoStatus = 'connected';
  } catch (error) {
    mongoStatus = `error: ${error.message}`;
  }

  const isHealthy = mongoStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      mongo: mongoStatus,
      server: 'running',
    },
  });
});

// GraphiQL - Interactive UI for development
app.get('/graphiql', (req, res) => {
  // Only serve GraphiQL in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'GraphiQL is disabled in production' });
  }

  // Serve GraphiQL HTML
  res.type('html');
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GraphiQL - Tom Cruise Running Analysis</title>
  <style>
    body { margin: 0; height: 100vh; overflow: hidden; }
    #graphiql { height: 100vh; }
  </style>
  <link rel="stylesheet" href="https://unpkg.com/graphiql@3/graphiql.min.css" />
</head>
<body>
  <div id="graphiql">Loading GraphiQL...</div>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/graphiql@3/graphiql.min.js"></script>
  <script>
    const root = ReactDOM.createRoot(document.getElementById('graphiql'));
    const fetcher = GraphiQL.createFetcher({ url: '/graphql' });
    root.render(React.createElement(GraphiQL, { fetcher: fetcher }));
  </script>
</body>
</html>
  `);
});

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

let server;

// Initialize connections and start server
async function startServer() {
  console.log('🚀 Starting Tom Cruise Running Analysis API...\n');

  // Start the Express server FIRST so Railway can connect
  console.log('=== ATTEMPTING TO START SERVER ===');
  console.log('Binding to PORT:', PORT);

  server = app.listen(PORT, '0.0.0.0', () => {
    console.log('=== SERVER LISTENING ===');
    console.log('Port:', PORT);
    console.log('Address: 0.0.0.0');
    console.log('════════════════════════════════════════════════════');
    console.log(`🎬 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log('════════════════════════════════════════════════════\n');
  });

  server.on('error', (err) => {
    console.error('=== SERVER ERROR ===');
    console.error('Failed to start:', err.message);
    console.error('Code:', err.code);
    console.error('Full error:', err);
    console.error('====================');
  });

  // MongoDB is the only datastore: without it the API cannot serve anything, so exit and
  // let the platform restart us (Railway restartPolicyType ON_FAILURE).
  try {
    console.log('🍃 Connecting to MongoDB...');
    await connectMongo();
    console.log('✓ MongoDB connected successfully\n');
  } catch (mongoError) {
    console.error('❌ MongoDB connection failed:', mongoError.message);
    process.exit(1);
  }
}

// Handle shutdown gracefully
async function shutdown(signal) {
  console.log(`\n🛑 ${signal} received, shutting down gracefully...`);
  if (server) await new Promise((resolve) => server.close(resolve));
  await closeMongo();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the server
startServer();
