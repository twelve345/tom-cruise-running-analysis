const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type Film {
    id: ID!
    title: String!
    year: Int!
    runtimeMinutes: Int
    rottenTomatoesScore: Int
    totalRunningDistanceFeet: Int!
    totalRunningTimeSeconds: Float!
    runningInstancesCount: Int!
    runningDensity: Float
    cpiScore: Float
    posterUrl: String
    imdbId: String
    runningInstances: [RunningInstance!]
    createdAt: String
    updatedAt: String
  }

  type RunningInstance {
    id: ID!
    filmId: Int!
    film: Film
    sequenceNumber: Int!
    distanceFeet: Int!
    durationSeconds: Float!
    timestampStart: String
    context: String
    intensity: String
    location: String
    createdAt: String
  }

  type User {
    id: ID!
    username: String!
    email: String!
    createdAt: String
    lastLogin: String
  }

  type FilmStats {
    totalFilms: Int!
    totalDistanceFeet: Int!
    totalRunningTimeSeconds: Float!
    totalRunningInstances: Int!
    averageDistancePerFilm: Float!
    careerMiles: Float!
  }

  type YearStats {
    year: Int!
    totalDistanceFeet: Int!
    filmCount: Int!
    films: [Film!]
  }

  input FilmFilterInput {
    minYear: Int
    maxYear: Int
    minDistance: Int
    maxDistance: Int
    minCpi: Float
    maxCpi: Float
    minRottenTomatoes: Int
  }

  input RunningInstanceFilterInput {
    filmId: Int
    minDistance: Int
    maxDistance: Int
    intensity: String
  }

  enum SortOrder {
    ASC
    DESC
  }

  enum FilmSortField {
    year
    title
    totalRunningDistanceFeet
    cpiScore
    rottenTomatoesScore
  }

  type Query {
    # Film queries
    films(
      filter: FilmFilterInput
      sortBy: FilmSortField
      sortOrder: SortOrder
      limit: Int
      offset: Int
    ): [Film!]!

    film(id: ID!): Film
    filmByTitle(title: String!): Film

    # Running instance queries
    runningInstances(
      filter: RunningInstanceFilterInput
      limit: Int
      offset: Int
    ): [RunningInstance!]!

    runningInstance(id: ID!): RunningInstance

    # Statistics queries
    filmStats: FilmStats!
    yearlyStats: [YearStats!]!
    topRunningFilms(limit: Int): [Film!]!
    topCpiFilms(limit: Int): [Film!]!

    # User queries (for future authentication)
    user(id: ID!): User
    users: [User!]!
  }

  type Mutation {
    # Film mutations
    createFilm(
      title: String!
      year: Int!
      runtimeMinutes: Int
      rottenTomatoesScore: Int
      posterUrl: String
      imdbId: String
    ): Film!

    updateFilm(
      id: ID!
      title: String
      year: Int
      runtimeMinutes: Int
      rottenTomatoesScore: Int
      posterUrl: String
      imdbId: String
    ): Film!

    deleteFilm(id: ID!): Boolean!

    # Running instance mutations
    createRunningInstance(
      filmId: Int!
      sequenceNumber: Int!
      distanceFeet: Int!
      durationSeconds: Float!
      timestampStart: String
      context: String
      intensity: String
      location: String
    ): RunningInstance!

    updateRunningInstance(
      id: ID!
      distanceFeet: Int
      durationSeconds: Float
      timestampStart: String
      context: String
      intensity: String
      location: String
    ): RunningInstance!

    deleteRunningInstance(id: ID!): Boolean!

    # User mutations (for future authentication)
    createUser(
      username: String!
      email: String!
      password: String!
    ): User!
  }
`);

module.exports = schema;
