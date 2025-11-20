/**
 * TypeScript type definitions for GraphQL queries
 * These types match the GraphQL schema defined in the backend
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export interface FilmStats {
  totalDistanceFeet: number;
  totalRunningTimeSeconds: number;
  careerMiles: number;
}

export interface Film {
  id: number;
  title: string;
  year: number;
  runtimeMinutes: number | null;
  totalRunningDistanceFeet: number;
  totalRunningTimeSeconds: number;
  runningInstancesCount: number;
  runningDensity: number;
  cpiScore: number | null;
  rottenTomatoesScore: number | null;
  posterUrl: string | null;
  imdbId: string | null;
  tmdbId: number | null;
  rottenTomatoesUrl: string | null;
  wikipediaUrl: string | null;
  youtubeTrailerUrl: string | null;
  letterboxdUrl: string | null;
}

export interface YearlyFilmSummary {
  title: string;
  totalRunningDistanceFeet: number;
}

export interface YearlyStats {
  year: number;
  totalDistanceFeet: number;
  filmCount: number;
  films: YearlyFilmSummary[];
}

export interface Location {
  setting: string | null;
  city: string | null;
  country: string | null;
}

export interface Scene {
  context: string | null;
  timestampStart: string | null;
  timestampEnd: string | null;
  intensity: string | null;
  location: Location;
}

export interface Measurement {
  distanceFeet: number;
  durationSeconds: number;
  confidence: string | null;
}

export interface Media {
  youtubeUrl: string | null;
  youtubeTimestamp: string | null;
}

export interface Metadata {
  behindTheScenes: boolean;
}

export interface RankingSource {
  provider: string;
  url: string;
  author: string | null;
}

export interface Sources {
  ranking: RankingSource;
}

export interface RunningInstance {
  id: number;
  rank: number;
  filmTitle: string;
  filmYear: number;
  sequenceNumber: number;
  scene: Scene;
  measurement: Measurement;
  media: Media;
  metadata: Metadata;
  tags: string[];
  sources: Sources;
}

// ============================================================================
// QUERY RESULT TYPES
// ============================================================================

export interface GetFilmStatsResult {
  filmStats: FilmStats;
}

export interface GetFilmsResult {
  films: Film[];
}

export interface GetVisualizationDataResult {
  yearlyStats: YearlyStats[];
  films: Film[];
}

export interface GetTopRunningFilmsResult {
  topRunningFilms: Film[];
}

export interface GetTopCpiFilmsResult {
  topCpiFilms: Film[];
}

export interface GetRunningInstancesResult {
  runningInstances: RunningInstance[];
}

// ============================================================================
// QUERY VARIABLES TYPES
// ============================================================================

export type FilmSortField =
  | 'title'
  | 'year'
  | 'totalRunningDistanceFeet'
  | 'rottenTomatoesScore'
  | 'cpiScore'
  | 'runningDensity';
export type SortOrder = 'ASC' | 'DESC';

export interface FilmFilterInput {
  yearRange?: {
    start?: number;
    end?: number;
  };
  runningDistanceRange?: {
    min?: number;
    max?: number;
  };
  rottenTomatoesScoreRange?: {
    min?: number;
    max?: number;
  };
}

export interface GetFilmsVariables {
  sortBy?: FilmSortField;
  sortOrder?: SortOrder;
  filter?: FilmFilterInput;
}

export interface GetTopRunningFilmsVariables {
  limit?: number;
}

export interface GetTopCpiFilmsVariables {
  limit?: number;
}

export interface GetRunningInstancesVariables {
  filmId: number;
  limit?: number;
}
