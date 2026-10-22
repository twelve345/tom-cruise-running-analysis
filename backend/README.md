# Tom Cruise Running Analysis - Backend API

GraphQL API for the Tom Cruise Running Analysis platform.

## Tech Stack

- **Node.js** with Express
- **GraphQL** with graphql-http
- **MongoDB** for all data (films, running instances, film metadata)

## Getting Started

### Prerequisites

- Node.js 24 LTS (version pinned in the repo-root `.nvmrc`)
- MongoDB (if running locally)

### Installation

```bash
npm install
```

### Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Set `MONGO_URL` in the `.env` file

### Database Setup

Load films, running instances and film metadata from the source data in `scripts/`:

```bash
npm run db:seed
```

The seed upserts and never deletes, so it is safe to re-run; production runs it on every boot
(`npm run start:railway`).

### Running the Server

Development mode (with hot reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will start on `http://localhost:4000`

## API Endpoints

- **GraphQL Endpoint**: `http://localhost:4000/graphql`
- **GraphiQL UI** (dev only): `http://localhost:4000/graphiql`
- **Health Check**: `http://localhost:4000/health`

## GraphQL Schema

### Key Types

- `Film` - Movie with running statistics
- `RunningInstance` - Individual running sequence in a film
- `FilmMetadata` - Trivia and running analysis for a film
- `FilmStats` - Aggregate statistics across all films
- `YearStats` - Statistics grouped by year

### Sample Queries

**Get all films:**

```graphql
query {
  films {
    id
    title
    year
    totalRunningDistanceFeet
    cpiScore
  }
}
```

**Get a specific film with running instances:**

```graphql
query {
  film(id: "1") {
    title
    year
    totalRunningDistanceFeet
    runningInstances {
      rank
      scene {
        context
        intensity
      }
    }
  }
}
```

**Get career statistics:**

```graphql
query {
  filmStats {
    totalFilms
    totalDistanceFeet
    careerMiles
    averageDistancePerFilm
  }
}
```

**Get top running films:**

```graphql
query {
  topRunningFilms(limit: 5) {
    title
    year
    totalRunningDistanceFeet
  }
}
```

### Sample Mutations

**Create a new film:**

```graphql
mutation {
  createFilm(title: "Top Gun: Maverick", year: 2022, runtimeMinutes: 131, rottenTomatoesScore: 96) {
    id
    title
    cpiScore
  }
}
```

**Add a running instance:**

```graphql
mutation {
  createRunningInstance(
    filmId: 1
    sequenceNumber: 1
    distanceFeet: 1200
    durationSeconds: 45.5
    context: "Chasing antagonist through streets"
    intensity: "sprint"
    location: "outdoor"
  ) {
    id
    rank
    measurement {
      distanceFeet
    }
  }
}
```

## Project Structure

```
backend/
├── db/
│   ├── mongodb.js       # MongoDB connection
│   ├── sync.js          # Idempotent seed from the source data
│   └── filmStats.js     # Derived film stats (running time, density, CPI)
├── graphql/
│   ├── schema.js        # GraphQL type definitions
│   └── resolvers.js     # GraphQL resolvers
├── scripts/
│   ├── seedMongo.js     # npm run db:seed
│   ├── enrichedMovieData.json       # Films source data
│   ├── extracted295instances.json   # Running instances source data
│   └── filmMetadata.json            # Film metadata source data
├── index.js             # Express server entry point
├── package.json
└── Dockerfile
```

## Docker

The backend is containerized and can be run with Docker:

```bash
docker-compose up backend
```

## Development Notes

- GraphiQL UI is enabled in development mode for easy testing
- Film running time, running density and CPI are derived when a film is seeded, created or updated (`db/filmStats.js`)
- CPI (Cruise Performance Index) is calculated with the formula:
  ```
  CPI = (Distance / Runtime) * (RT Score / 100)
  ```
