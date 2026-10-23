const { buildSchema } = require('graphql');

const schema = buildSchema(`
  # ============================================================================
  # Film Types (films collection)
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
  # Running Instance + Metadata Types (runninginstances, filmmetadata collections)
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
  # Composite + Statistics Types
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

    # Running instance queries
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

    # Composite queries
    filmWithScenes(id: ID!): FilmWithScenes
    topFilmsByIntensity(intensity: String!, limit: Int): [Film!]!
  }
`);

module.exports = schema;
