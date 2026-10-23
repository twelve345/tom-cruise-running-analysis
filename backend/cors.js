/**
 * CORS policy for the API.
 *
 * Browsers may read API responses only from the site's own origins. Requests without an
 * Origin header (curl, server-to-server, health checks) are not cross-origin, so CORS
 * doesn't apply and they pass. Any other origin gets no CORS headers, so the browser
 * blocks the read; `callback(null, false)` is used rather than an Error, which Express
 * would turn into a 500.
 */
const allowedOrigins = [
  'https://tomcruiserunningtime.com',
  'https://www.tomcruiserunningtime.com',
  'https://tom-cruise-running-time.up.railway.app',
  // Local development: Vite dev server, `vite preview`, and docker-compose's port mapping.
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
];

const corsOptions = {
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.includes(origin));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
};

module.exports = { allowedOrigins, corsOptions };
