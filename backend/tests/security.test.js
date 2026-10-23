const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { createHandler } = require('graphql-http/lib/use/express');
const schema = require('../graphql/schema');
const resolvers = require('../graphql/resolvers');
const { allowedOrigins, corsOptions } = require('../cors');

describe('Read-only API', () => {
  it('defines no mutations', () => {
    expect(schema.getMutationType()).toBeUndefined();
  });

  it('rejects a mutation request without touching the database', async () => {
    const app = express();
    app.use(express.json());
    app.post('/graphql', createHandler({ schema, rootValue: resolvers }));

    const res = await request(app)
      .post('/graphql')
      .set('Accept', 'application/json')
      .send({ query: 'mutation { deleteFilm(id: "1") }' });

    // graphql-js refuses before any resolver runs.
    expect(res.body.data ?? null).toBeNull();
    expect(res.body.errors?.[0]?.message).toMatch(/not configured to execute mutation/i);
  });
});

describe('CORS', () => {
  const app = express();
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  app.get('/graphql', (req, res) => res.json({ ok: true }));

  it.each(allowedOrigins)('lets %s read responses', async (origin) => {
    const res = await request(app).get('/graphql').set('Origin', origin);
    expect(res.headers['access-control-allow-origin']).toBe(origin);
  });

  it('sends no CORS headers to any other origin', async () => {
    const res = await request(app).get('/graphql').set('Origin', 'https://example.com');
    expect(res.statusCode).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('does not approve a preflight from any other origin', async () => {
    const res = await request(app)
      .options('/graphql')
      .set('Origin', 'https://example.com')
      .set('Access-Control-Request-Method', 'POST');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('serves requests without an Origin header (curl, health checks)', async () => {
    const res = await request(app).get('/graphql');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('does not allow credentials', async () => {
    const res = await request(app).get('/graphql').set('Origin', allowedOrigins[0]);
    expect(res.headers['access-control-allow-credentials']).toBeUndefined();
  });
});
