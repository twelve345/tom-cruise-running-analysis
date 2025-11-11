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
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check PostgreSQL connection
    await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        postgres: 'connected',
        server: 'running',
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
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
app.all(
  '/graphql',
  createHandler({
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
  })
);

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
