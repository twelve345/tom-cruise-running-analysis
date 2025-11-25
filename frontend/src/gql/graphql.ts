import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type BehindTheScenesItem = {
  __typename?: 'BehindTheScenesItem';
  author?: Maybe<Scalars['String']['output']>;
  excerpt?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type CoachQuote = {
  __typename?: 'CoachQuote';
  coach: Scalars['String']['output'];
  date?: Maybe<Scalars['String']['output']>;
  quote: Scalars['String']['output'];
  source?: Maybe<Scalars['String']['output']>;
};

export type DataSource = {
  __typename?: 'DataSource';
  author?: Maybe<Scalars['String']['output']>;
  methodology?: Maybe<Scalars['String']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type DataSourceInfo = {
  __typename?: 'DataSourceInfo';
  methodology?: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
  retrievedAt?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type DataSources = {
  __typename?: 'DataSources';
  metadata: DataSourceInfo;
  poster: DataSourceInfo;
  runningDistance: DataSourceInfo;
};

export type Film = {
  __typename?: 'Film';
  cpiScore?: Maybe<Scalars['Float']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  dataSources?: Maybe<DataSources>;
  id: Scalars['ID']['output'];
  imdbId?: Maybe<Scalars['String']['output']>;
  letterboxdUrl?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<FilmMetadata>;
  posterUrl?: Maybe<Scalars['String']['output']>;
  rottenTomatoesScore?: Maybe<Scalars['Int']['output']>;
  rottenTomatoesUrl?: Maybe<Scalars['String']['output']>;
  runningDensity?: Maybe<Scalars['Float']['output']>;
  runningInstances?: Maybe<Array<RunningInstance>>;
  runningInstancesCount: Scalars['Int']['output'];
  runtimeMinutes?: Maybe<Scalars['Int']['output']>;
  title: Scalars['String']['output'];
  tmdbId?: Maybe<Scalars['Int']['output']>;
  totalRunningDistanceFeet: Scalars['Int']['output'];
  totalRunningTimeSeconds: Scalars['Float']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
  wikipediaUrl?: Maybe<Scalars['String']['output']>;
  year: Scalars['Int']['output'];
  youtubeTrailerUrl?: Maybe<Scalars['String']['output']>;
};

export type FilmFilterInput = {
  maxCpi?: InputMaybe<Scalars['Float']['input']>;
  maxDistance?: InputMaybe<Scalars['Int']['input']>;
  maxYear?: InputMaybe<Scalars['Int']['input']>;
  minCpi?: InputMaybe<Scalars['Float']['input']>;
  minDistance?: InputMaybe<Scalars['Int']['input']>;
  minRottenTomatoes?: InputMaybe<Scalars['Int']['input']>;
  minYear?: InputMaybe<Scalars['Int']['input']>;
};

export type FilmMetadata = {
  __typename?: 'FilmMetadata';
  behindTheScenes?: Maybe<Array<BehindTheScenesItem>>;
  createdAt?: Maybe<Scalars['String']['output']>;
  filmId: Scalars['Int']['output'];
  filmTitle: Scalars['String']['output'];
  filmYear: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  runningAnalysis?: Maybe<RunningAnalysis>;
  trivia?: Maybe<Array<TriviaItem>>;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type FilmSortField =
  | 'cpiScore'
  | 'rottenTomatoesScore'
  | 'runningInstancesCount'
  | 'runtimeMinutes'
  | 'title'
  | 'totalRunningDistanceFeet'
  | 'year';

export type FilmStats = {
  __typename?: 'FilmStats';
  averageDistancePerFilm: Scalars['Float']['output'];
  careerMiles: Scalars['Float']['output'];
  totalDistanceFeet: Scalars['Int']['output'];
  totalFilms: Scalars['Int']['output'];
  totalRunningTimeSeconds: Scalars['Float']['output'];
};

export type FilmWithScenes = {
  __typename?: 'FilmWithScenes';
  film: Film;
  instances: Array<RunningInstance>;
  metadata?: Maybe<FilmMetadata>;
};

export type FormBreakdown = {
  __typename?: 'FormBreakdown';
  elbowAngle?: Maybe<Scalars['String']['output']>;
  footStrike?: Maybe<Scalars['String']['output']>;
  kneeHeight?: Maybe<Scalars['String']['output']>;
  overallAnalysis?: Maybe<Scalars['String']['output']>;
};

export type InstanceMetadata = {
  __typename?: 'InstanceMetadata';
  behindTheScenes?: Maybe<Scalars['String']['output']>;
  cinematographer?: Maybe<Scalars['String']['output']>;
  director?: Maybe<Scalars['String']['output']>;
  directorQuotes?: Maybe<Array<Scalars['String']['output']>>;
  stunts?: Maybe<Stunts>;
};

export type InstanceSources = {
  __typename?: 'InstanceSources';
  description: DataSource;
  distance: DataSource;
  ranking: DataSource;
};

export type Location = {
  __typename?: 'Location';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  setting?: Maybe<Scalars['String']['output']>;
};

export type Measurement = {
  __typename?: 'Measurement';
  calculatedAt?: Maybe<Scalars['String']['output']>;
  calculatedBy?: Maybe<Scalars['String']['output']>;
  confidence?: Maybe<Scalars['String']['output']>;
  distanceFeet?: Maybe<Scalars['Int']['output']>;
  durationSeconds?: Maybe<Scalars['Float']['output']>;
  source?: Maybe<Scalars['String']['output']>;
};

export type Media = {
  __typename?: 'Media';
  clips?: Maybe<Array<Scalars['String']['output']>>;
  screenshots?: Maybe<Array<Scalars['String']['output']>>;
  youtubeTimestamp?: Maybe<Scalars['String']['output']>;
  youtubeUrl?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createFilm: Film;
  createRunningInstance: RunningInstance;
  createUser: User;
  deleteFilm: Scalars['Boolean']['output'];
  deleteRunningInstance: Scalars['Boolean']['output'];
  updateFilm: Film;
  updateRunningInstance: RunningInstance;
};

export type MutationCreateFilmArgs = {
  imdbId?: InputMaybe<Scalars['String']['input']>;
  posterUrl?: InputMaybe<Scalars['String']['input']>;
  rottenTomatoesScore?: InputMaybe<Scalars['Int']['input']>;
  runtimeMinutes?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};

export type MutationCreateRunningInstanceArgs = {
  context?: InputMaybe<Scalars['String']['input']>;
  distanceFeet: Scalars['Int']['input'];
  durationSeconds: Scalars['Float']['input'];
  filmId: Scalars['Int']['input'];
  intensity?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  sequenceNumber: Scalars['Int']['input'];
  timestampStart?: InputMaybe<Scalars['String']['input']>;
};

export type MutationCreateUserArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type MutationDeleteFilmArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteRunningInstanceArgs = {
  id: Scalars['ID']['input'];
};

export type MutationUpdateFilmArgs = {
  id: Scalars['ID']['input'];
  imdbId?: InputMaybe<Scalars['String']['input']>;
  posterUrl?: InputMaybe<Scalars['String']['input']>;
  rottenTomatoesScore?: InputMaybe<Scalars['Int']['input']>;
  runtimeMinutes?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type MutationUpdateRunningInstanceArgs = {
  context?: InputMaybe<Scalars['String']['input']>;
  distanceFeet?: InputMaybe<Scalars['Int']['input']>;
  durationSeconds?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['ID']['input'];
  intensity?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  timestampStart?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  allFilmMetadata: Array<FilmMetadata>;
  film?: Maybe<Film>;
  filmByTitle?: Maybe<Film>;
  filmMetadata?: Maybe<FilmMetadata>;
  filmStats: FilmStats;
  filmWithScenes?: Maybe<FilmWithScenes>;
  films: Array<Film>;
  runningInstance?: Maybe<RunningInstance>;
  runningInstanceByRank?: Maybe<RunningInstance>;
  runningInstances: Array<RunningInstance>;
  searchRunningScenes: Array<RunningInstance>;
  topCpiFilms: Array<Film>;
  topFilmsByIntensity: Array<Film>;
  topRunningFilms: Array<Film>;
  user?: Maybe<User>;
  users: Array<User>;
  yearlyStats: Array<YearStats>;
};

export type QueryFilmArgs = {
  id: Scalars['ID']['input'];
};

export type QueryFilmByTitleArgs = {
  title: Scalars['String']['input'];
};

export type QueryFilmMetadataArgs = {
  filmId: Scalars['Int']['input'];
};

export type QueryFilmWithScenesArgs = {
  id: Scalars['ID']['input'];
};

export type QueryFilmsArgs = {
  filter?: InputMaybe<FilmFilterInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<FilmSortField>;
  sortOrder?: InputMaybe<SortOrder>;
};

export type QueryRunningInstanceArgs = {
  id: Scalars['ID']['input'];
};

export type QueryRunningInstanceByRankArgs = {
  rank: Scalars['Int']['input'];
};

export type QueryRunningInstancesArgs = {
  filmId?: InputMaybe<Scalars['Int']['input']>;
  intensity?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type QuerySearchRunningScenesArgs = {
  query: Scalars['String']['input'];
};

export type QueryTopCpiFilmsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryTopFilmsByIntensityArgs = {
  intensity: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryTopRunningFilmsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type RunningAnalysis = {
  __typename?: 'RunningAnalysis';
  coachQuotes?: Maybe<Array<CoachQuote>>;
  comparisonToAthletes?: Maybe<Scalars['String']['output']>;
  formBreakdown?: Maybe<FormBreakdown>;
  speedAnalysis?: Maybe<Scalars['String']['output']>;
};

export type RunningInstance = {
  __typename?: 'RunningInstance';
  createdAt?: Maybe<Scalars['String']['output']>;
  film?: Maybe<Film>;
  filmId: Scalars['Int']['output'];
  filmTitle: Scalars['String']['output'];
  filmYear: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  measurement?: Maybe<Measurement>;
  media?: Maybe<Media>;
  metadata?: Maybe<InstanceMetadata>;
  rank: Scalars['Int']['output'];
  scene: Scene;
  sequenceNumber?: Maybe<Scalars['Int']['output']>;
  sources: InstanceSources;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type RunningInstanceFilterInput = {
  filmId?: InputMaybe<Scalars['Int']['input']>;
  intensity?: InputMaybe<Scalars['String']['input']>;
  maxDistance?: InputMaybe<Scalars['Int']['input']>;
  minDistance?: InputMaybe<Scalars['Int']['input']>;
};

export type Scene = {
  __typename?: 'Scene';
  context: Scalars['String']['output'];
  intensity?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Location>;
  timestampEnd?: Maybe<Scalars['String']['output']>;
  timestampStart?: Maybe<Scalars['String']['output']>;
};

export type SortOrder = 'ASC' | 'DESC';

export type Stunts = {
  __typename?: 'Stunts';
  injuries?: Maybe<Array<Scalars['String']['output']>>;
  isTomCruise?: Maybe<Scalars['Boolean']['output']>;
  stuntDouble?: Maybe<Scalars['String']['output']>;
};

export type TriviaItem = {
  __typename?: 'TriviaItem';
  category: Scalars['String']['output'];
  fact: Scalars['String']['output'];
  source?: Maybe<Scalars['String']['output']>;
  sourceUrl?: Maybe<Scalars['String']['output']>;
  verified?: Maybe<Scalars['Boolean']['output']>;
};

export type User = {
  __typename?: 'User';
  createdAt?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastLogin?: Maybe<Scalars['String']['output']>;
  username: Scalars['String']['output'];
};

export type YearStats = {
  __typename?: 'YearStats';
  filmCount: Scalars['Int']['output'];
  films?: Maybe<Array<Film>>;
  totalDistanceFeet: Scalars['Int']['output'];
  year: Scalars['Int']['output'];
};

export type GetFilmsQueryVariables = Exact<{
  sortBy?: InputMaybe<FilmSortField>;
  sortOrder?: InputMaybe<SortOrder>;
  filter?: InputMaybe<FilmFilterInput>;
}>;

export type GetFilmsQuery = {
  __typename?: 'Query';
  films: Array<{
    __typename?: 'Film';
    id: string;
    title: string;
    year: number;
    runtimeMinutes?: number | null;
    totalRunningDistanceFeet: number;
    totalRunningTimeSeconds: number;
    runningInstancesCount: number;
    runningDensity?: number | null;
    cpiScore?: number | null;
    rottenTomatoesScore?: number | null;
    posterUrl?: string | null;
    imdbId?: string | null;
    tmdbId?: number | null;
    rottenTomatoesUrl?: string | null;
    wikipediaUrl?: string | null;
    youtubeTrailerUrl?: string | null;
    letterboxdUrl?: string | null;
  }>;
};

export type GetRunningInstancesQueryVariables = Exact<{
  filmId: Scalars['Int']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetRunningInstancesQuery = {
  __typename?: 'Query';
  runningInstances: Array<{
    __typename?: 'RunningInstance';
    id: string;
    rank: number;
    filmTitle: string;
    filmYear: number;
    sequenceNumber?: number | null;
    tags?: Array<string> | null;
    scene: {
      __typename?: 'Scene';
      context: string;
      timestampStart?: string | null;
      timestampEnd?: string | null;
      intensity?: string | null;
      location?: {
        __typename?: 'Location';
        setting?: string | null;
        city?: string | null;
        country?: string | null;
      } | null;
    };
    measurement?: {
      __typename?: 'Measurement';
      distanceFeet?: number | null;
      durationSeconds?: number | null;
      confidence?: string | null;
    } | null;
    media?: {
      __typename?: 'Media';
      youtubeUrl?: string | null;
      youtubeTimestamp?: string | null;
    } | null;
    metadata?: { __typename?: 'InstanceMetadata'; behindTheScenes?: string | null } | null;
    sources: {
      __typename?: 'InstanceSources';
      ranking: {
        __typename?: 'DataSource';
        provider: string;
        url?: string | null;
        author?: string | null;
      };
    };
  }>;
};

export type GetFilmStatsQueryVariables = Exact<{ [key: string]: never }>;

export type GetFilmStatsQuery = {
  __typename?: 'Query';
  filmStats: {
    __typename?: 'FilmStats';
    totalDistanceFeet: number;
    totalRunningTimeSeconds: number;
    careerMiles: number;
  };
};

export type GetVisualizationDataQueryVariables = Exact<{ [key: string]: never }>;

export type GetVisualizationDataQuery = {
  __typename?: 'Query';
  yearlyStats: Array<{
    __typename?: 'YearStats';
    year: number;
    totalDistanceFeet: number;
    filmCount: number;
    films?: Array<{ __typename?: 'Film'; title: string; totalRunningDistanceFeet: number }> | null;
  }>;
  films: Array<{
    __typename?: 'Film';
    id: string;
    title: string;
    year: number;
    totalRunningDistanceFeet: number;
    rottenTomatoesScore?: number | null;
    cpiScore?: number | null;
    runningDensity?: number | null;
    runtimeMinutes?: number | null;
  }>;
};

export type GetTopRunningFilmsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetTopRunningFilmsQuery = {
  __typename?: 'Query';
  topRunningFilms: Array<{
    __typename?: 'Film';
    id: string;
    title: string;
    year: number;
    totalRunningDistanceFeet: number;
    rottenTomatoesScore?: number | null;
  }>;
};

export type GetTopCpiFilmsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetTopCpiFilmsQuery = {
  __typename?: 'Query';
  topCpiFilms: Array<{
    __typename?: 'Film';
    id: string;
    title: string;
    year: number;
    totalRunningDistanceFeet: number;
    rottenTomatoesScore?: number | null;
    cpiScore?: number | null;
  }>;
};

export const GetFilmsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetFilms' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'sortBy' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'FilmSortField' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'sortOrder' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'SortOrder' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'filter' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'FilmFilterInput' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'films' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sortBy' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'sortBy' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sortOrder' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'sortOrder' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'filter' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'IntValue', value: '100' },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'year' } },
                { kind: 'Field', name: { kind: 'Name', value: 'runtimeMinutes' } },
                { kind: 'Field', name: { kind: 'Name', value: 'totalRunningDistanceFeet' } },
                { kind: 'Field', name: { kind: 'Name', value: 'totalRunningTimeSeconds' } },
                { kind: 'Field', name: { kind: 'Name', value: 'runningInstancesCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'runningDensity' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cpiScore' } },
                { kind: 'Field', name: { kind: 'Name', value: 'rottenTomatoesScore' } },
                { kind: 'Field', name: { kind: 'Name', value: 'posterUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imdbId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tmdbId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'rottenTomatoesUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'wikipediaUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'youtubeTrailerUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'letterboxdUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetFilmsQuery, GetFilmsQueryVariables>;
export const GetRunningInstancesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetRunningInstances' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'filmId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'runningInstances' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filmId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'filmId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'rank' } },
                { kind: 'Field', name: { kind: 'Name', value: 'filmTitle' } },
                { kind: 'Field', name: { kind: 'Name', value: 'filmYear' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sequenceNumber' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'scene' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'context' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'timestampStart' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'timestampEnd' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'intensity' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'location' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'setting' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'city' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'country' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'measurement' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'distanceFeet' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'durationSeconds' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'confidence' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'media' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'youtubeUrl' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'youtubeTimestamp' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'metadata' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'behindTheScenes' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'tags' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'sources' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'ranking' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'provider' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'author' } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetRunningInstancesQuery, GetRunningInstancesQueryVariables>;
export const GetFilmStatsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetFilmStats' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'filmStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'totalDistanceFeet' } },
                { kind: 'Field', name: { kind: 'Name', value: 'totalRunningTimeSeconds' } },
                { kind: 'Field', name: { kind: 'Name', value: 'careerMiles' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetFilmStatsQuery, GetFilmStatsQueryVariables>;
export const GetVisualizationDataDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetVisualizationData' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'yearlyStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'year' } },
                { kind: 'Field', name: { kind: 'Name', value: 'totalDistanceFeet' } },
                { kind: 'Field', name: { kind: 'Name', value: 'filmCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'films' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'totalRunningDistanceFeet' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'films' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'IntValue', value: '100' },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'year' } },
                { kind: 'Field', name: { kind: 'Name', value: 'totalRunningDistanceFeet' } },
                { kind: 'Field', name: { kind: 'Name', value: 'rottenTomatoesScore' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cpiScore' } },
                { kind: 'Field', name: { kind: 'Name', value: 'runningDensity' } },
                { kind: 'Field', name: { kind: 'Name', value: 'runtimeMinutes' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetVisualizationDataQuery, GetVisualizationDataQueryVariables>;
export const GetTopRunningFilmsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetTopRunningFilms' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'topRunningFilms' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'year' } },
                { kind: 'Field', name: { kind: 'Name', value: 'totalRunningDistanceFeet' } },
                { kind: 'Field', name: { kind: 'Name', value: 'rottenTomatoesScore' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetTopRunningFilmsQuery, GetTopRunningFilmsQueryVariables>;
export const GetTopCpiFilmsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetTopCpiFilms' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'topCpiFilms' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'year' } },
                { kind: 'Field', name: { kind: 'Name', value: 'totalRunningDistanceFeet' } },
                { kind: 'Field', name: { kind: 'Name', value: 'rottenTomatoesScore' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cpiScore' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetTopCpiFilmsQuery, GetTopCpiFilmsQueryVariables>;
