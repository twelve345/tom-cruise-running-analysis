# Tom Cruise Running Analysis - Backend API

GraphQL API for the Tom Cruise Running Analysis platform.

## Tech Stack

- **Node.js** with Express
- **GraphQL** with graphql-http
- **PostgreSQL** for structured data (films, running instances, users)
- **MongoDB** for flexible data (future features like user dashboards)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (if running locally)
- MongoDB (optional, if running locally)

### Installation

```bash
npm install
```

### Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update the `.env` file with your database credentials

### Database Setup

Initialize the database tables:

```bash
npm run db:init
```

Seed with sample data:

```bash
npm run db:seed
```

Or do both at once:

```bash
npm run db:setup
```

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
- **GraphiQL UI** (dev only): `http://localhost:4000/graphql`
- **Health Check**: `http://localhost:4000/health`

## GraphQL Schema

### Key Types

- `Film` - Movie with running statistics
- `RunningInstance` - Individual running sequence in a film
- `User` - User account (for future features)
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
      distanceFeet
      durationSeconds
      context
      intensity
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
    distanceFeet
  }
}
```

## Project Structure

```
backend/
├── db/
│   ├── postgres.js      # PostgreSQL connection
│   ├── mongodb.js       # MongoDB connection
│   └── init.sql         # Database schema
├── graphql/
│   ├── schema.js        # GraphQL type definitions
│   └── resolvers.js     # GraphQL resolvers
├── scripts/
│   ├── initDb.js        # Database initialization
│   └── seedDb.js        # Sample data seeding
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
- PostgreSQL triggers automatically update film statistics when running instances are added/modified
- CPI (Cruise Performance Index) is calculated automatically based on the formula:
  ```
  CPI = (Distance / Runtime) * (RT Score / 100)
  ```
