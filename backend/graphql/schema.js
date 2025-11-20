const { buildSchema } = require('graphql');

const schema = buildSchema(`
  # ============================================================================
  # PostgreSQL Types (Core relational data)
  # ============================================================================

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
    tmdbId: Int
    rottenTomatoesUrl: String
    wikipediaUrl: String
    youtubeTrailerUrl: String
    letterboxdUrl: String
    runningInstances: [RunningInstance!]
    metadata: FilmMetadata
    dataSources: DataSources
    createdAt: String
    updatedAt: String
  }

  # ============================================================================
  # MongoDB Types (Flexible document data)
  # ============================================================================

  type RunningInstance {
    id: ID!
    filmId: Int!
    film: Film
    filmTitle: String!
    filmYear: Int!
    rank: Int!
    sequenceNumber: Int
    scene: Scene!
    measurement: Measurement
    media: Media
    metadata: InstanceMetadata
    tags: [String!]
    sources: InstanceSources!
    createdAt: String
    updatedAt: String
  }

  type Scene {
    context: String!
    timestampStart: String
    timestampEnd: String
    intensity: String
    location: Location
  }

  type Location {
    setting: String
    city: String
    country: String
  }

  type Measurement {
    distanceFeet: Int
    durationSeconds: Float
    calculatedBy: String
    confidence: String
    source: String
    calculatedAt: String
  }

  type Media {
    youtubeUrl: String
    youtubeTimestamp: String
    clips: [String!]
    screenshots: [String!]
  }

  type InstanceMetadata {
    director: String
    cinematographer: String
    stunts: Stunts
    behindTheScenes: String
    directorQuotes: [String!]
  }

  type Stunts {
    isTomCruise: Boolean
    stuntDouble: String
    injuries: [String!]
  }

  type InstanceSources {
    ranking: DataSource!
    description: DataSource!
    distance: DataSource!
  }

  type DataSource {
    provider: String!
    url: String
    author: String
    publishedAt: String
    methodology: String
    note: String
  }

  type FilmMetadata {
    id: ID!
    filmId: Int!
    filmTitle: String!
    filmYear: Int!
    trivia: [TriviaItem!]
    runningAnalysis: RunningAnalysis
    behindTheScenes: [BehindTheScenesItem!]
    createdAt: String
    updatedAt: String
  }

  type TriviaItem {
    category: String!
    fact: String!
    source: String
    sourceUrl: String
    verified: Boolean
  }

  type RunningAnalysis {
    formBreakdown: FormBreakdown
    coachQuotes: [CoachQuote!]
    comparisonToAthletes: String
    speedAnalysis: String
  }

  type FormBreakdown {
    elbowAngle: String
    kneeHeight: String
    footStrike: String
    overallAnalysis: String
  }

  type CoachQuote {
    coach: String!
    quote: String!
    source: String
    date: String
  }

  type BehindTheScenesItem {
    type: String!
    title: String!
    url: String
    excerpt: String
    publishedAt: String
    author: String
  }

  # ============================================================================
  # Hybrid Types (Combining PostgreSQL + MongoDB data)
  # ============================================================================

  type FilmWithScenes {
    film: Film!
    instances: [RunningInstance!]!
    metadata: FilmMetadata
  }

  type DataSources {
    metadata: DataSourceInfo!
    runningDistance: DataSourceInfo!
    poster: DataSourceInfo!
  }

  type DataSourceInfo {
    provider: String!
    url: String
    retrievedAt: String
    methodology: String
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
    runtimeMinutes
    totalRunningDistanceFeet
    runningInstancesCount
    cpiScore
    rottenTomatoesScore
  }

  type Query {
    # ========================================================================
    # PostgreSQL Queries (Core relational data)
    # ========================================================================

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

    # Statistics queries
    filmStats: FilmStats!
    yearlyStats: [YearStats!]!
    topRunningFilms(limit: Int): [Film!]!
    topCpiFilms(limit: Int): [Film!]!

    # ========================================================================
    # MongoDB Queries (Flexible document data)
    # ========================================================================

    # Running instance queries (MongoDB)
    runningInstances(
      filmId: Int
      intensity: String
      tags: [String!]
      limit: Int
      offset: Int
    ): [RunningInstance!]!

    runningInstance(id: ID!): RunningInstance
    runningInstanceByRank(rank: Int!): RunningInstance

    # Search queries
    searchRunningScenes(query: String!): [RunningInstance!]!

    # Film metadata queries
    filmMetadata(filmId: Int!): FilmMetadata
    allFilmMetadata: [FilmMetadata!]!

    # Hybrid queries (Postgres + MongoDB)
    filmWithScenes(id: ID!): FilmWithScenes
    topFilmsByIntensity(intensity: String!, limit: Int): [Film!]!

    # ========================================================================
    # User Queries
    # ========================================================================
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
