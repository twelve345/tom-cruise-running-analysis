/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  '\n  query GetFilms($sortBy: FilmSortField, $sortOrder: SortOrder, $filter: FilmFilterInput) {\n    films(sortBy: $sortBy, sortOrder: $sortOrder, filter: $filter, limit: 100) {\n      id\n      title\n      year\n      runtimeMinutes\n      totalRunningDistanceFeet\n      totalRunningTimeSeconds\n      runningInstancesCount\n      runningDensity\n      cpiScore\n      rottenTomatoesScore\n      posterUrl\n      imdbId\n      tmdbId\n      rottenTomatoesUrl\n      wikipediaUrl\n      youtubeTrailerUrl\n      letterboxdUrl\n    }\n  }\n': typeof types.GetFilmsDocument;
  '\n  query GetRunningInstances($filmId: Int!, $limit: Int) {\n    runningInstances(filmId: $filmId, limit: $limit) {\n      id\n      rank\n      filmTitle\n      filmYear\n      sequenceNumber\n      scene {\n        context\n        timestampStart\n        timestampEnd\n        intensity\n        location {\n          setting\n          city\n          country\n        }\n      }\n      measurement {\n        distanceFeet\n        durationSeconds\n        confidence\n      }\n      media {\n        youtubeUrl\n        youtubeTimestamp\n      }\n      metadata {\n        behindTheScenes\n      }\n      tags\n      sources {\n        ranking {\n          provider\n          url\n          author\n        }\n      }\n    }\n  }\n': typeof types.GetRunningInstancesDocument;
  '\n  query GetFilmStats {\n    filmStats {\n      totalDistanceFeet\n      totalRunningTimeSeconds\n      careerMiles\n    }\n  }\n': typeof types.GetFilmStatsDocument;
  '\n  query GetVisualizationData {\n    yearlyStats {\n      year\n      totalDistanceFeet\n      filmCount\n      films {\n        title\n        totalRunningDistanceFeet\n      }\n    }\n    films(limit: 100) {\n      id\n      title\n      year\n      totalRunningDistanceFeet\n      rottenTomatoesScore\n      cpiScore\n      runningDensity\n      runtimeMinutes\n    }\n  }\n': typeof types.GetVisualizationDataDocument;
  '\n  query GetTopRunningFilms($limit: Int) {\n    topRunningFilms(limit: $limit) {\n      id\n      title\n      year\n      totalRunningDistanceFeet\n      rottenTomatoesScore\n    }\n  }\n': typeof types.GetTopRunningFilmsDocument;
  '\n  query GetTopCpiFilms($limit: Int) {\n    topCpiFilms(limit: $limit) {\n      id\n      title\n      year\n      totalRunningDistanceFeet\n      rottenTomatoesScore\n      cpiScore\n    }\n  }\n': typeof types.GetTopCpiFilmsDocument;
};
const documents: Documents = {
  '\n  query GetFilms($sortBy: FilmSortField, $sortOrder: SortOrder, $filter: FilmFilterInput) {\n    films(sortBy: $sortBy, sortOrder: $sortOrder, filter: $filter, limit: 100) {\n      id\n      title\n      year\n      runtimeMinutes\n      totalRunningDistanceFeet\n      totalRunningTimeSeconds\n      runningInstancesCount\n      runningDensity\n      cpiScore\n      rottenTomatoesScore\n      posterUrl\n      imdbId\n      tmdbId\n      rottenTomatoesUrl\n      wikipediaUrl\n      youtubeTrailerUrl\n      letterboxdUrl\n    }\n  }\n':
    types.GetFilmsDocument,
  '\n  query GetRunningInstances($filmId: Int!, $limit: Int) {\n    runningInstances(filmId: $filmId, limit: $limit) {\n      id\n      rank\n      filmTitle\n      filmYear\n      sequenceNumber\n      scene {\n        context\n        timestampStart\n        timestampEnd\n        intensity\n        location {\n          setting\n          city\n          country\n        }\n      }\n      measurement {\n        distanceFeet\n        durationSeconds\n        confidence\n      }\n      media {\n        youtubeUrl\n        youtubeTimestamp\n      }\n      metadata {\n        behindTheScenes\n      }\n      tags\n      sources {\n        ranking {\n          provider\n          url\n          author\n        }\n      }\n    }\n  }\n':
    types.GetRunningInstancesDocument,
  '\n  query GetFilmStats {\n    filmStats {\n      totalDistanceFeet\n      totalRunningTimeSeconds\n      careerMiles\n    }\n  }\n':
    types.GetFilmStatsDocument,
  '\n  query GetVisualizationData {\n    yearlyStats {\n      year\n      totalDistanceFeet\n      filmCount\n      films {\n        title\n        totalRunningDistanceFeet\n      }\n    }\n    films(limit: 100) {\n      id\n      title\n      year\n      totalRunningDistanceFeet\n      rottenTomatoesScore\n      cpiScore\n      runningDensity\n      runtimeMinutes\n    }\n  }\n':
    types.GetVisualizationDataDocument,
  '\n  query GetTopRunningFilms($limit: Int) {\n    topRunningFilms(limit: $limit) {\n      id\n      title\n      year\n      totalRunningDistanceFeet\n      rottenTomatoesScore\n    }\n  }\n':
    types.GetTopRunningFilmsDocument,
  '\n  query GetTopCpiFilms($limit: Int) {\n    topCpiFilms(limit: $limit) {\n      id\n      title\n      year\n      totalRunningDistanceFeet\n      rottenTomatoesScore\n      cpiScore\n    }\n  }\n':
    types.GetTopCpiFilmsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetFilms($sortBy: FilmSortField, $sortOrder: SortOrder, $filter: FilmFilterInput) {\n    films(sortBy: $sortBy, sortOrder: $sortOrder, filter: $filter, limit: 100) {\n      id\n      title\n      year\n      runtimeMinutes\n      totalRunningDistanceFeet\n      totalRunningTimeSeconds\n      runningInstancesCount\n      runningDensity\n      cpiScore\n      rottenTomatoesScore\n      posterUrl\n      imdbId\n      tmdbId\n      rottenTomatoesUrl\n      wikipediaUrl\n      youtubeTrailerUrl\n      letterboxdUrl\n    }\n  }\n'
): (typeof documents)['\n  query GetFilms($sortBy: FilmSortField, $sortOrder: SortOrder, $filter: FilmFilterInput) {\n    films(sortBy: $sortBy, sortOrder: $sortOrder, filter: $filter, limit: 100) {\n      id\n      title\n      year\n      runtimeMinutes\n      totalRunningDistanceFeet\n      totalRunningTimeSeconds\n      runningInstancesCount\n      runningDensity\n      cpiScore\n      rottenTomatoesScore\n      posterUrl\n      imdbId\n      tmdbId\n      rottenTomatoesUrl\n      wikipediaUrl\n      youtubeTrailerUrl\n      letterboxdUrl\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetRunningInstances($filmId: Int!, $limit: Int) {\n    runningInstances(filmId: $filmId, limit: $limit) {\n      id\n      rank\n      filmTitle\n      filmYear\n      sequenceNumber\n      scene {\n        context\n        timestampStart\n        timestampEnd\n        intensity\n        location {\n          setting\n          city\n          country\n        }\n      }\n      measurement {\n        distanceFeet\n        durationSeconds\n        confidence\n      }\n      media {\n        youtubeUrl\n        youtubeTimestamp\n      }\n      metadata {\n        behindTheScenes\n      }\n      tags\n      sources {\n        ranking {\n          provider\n          url\n          author\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query GetRunningInstances($filmId: Int!, $limit: Int) {\n    runningInstances(filmId: $filmId, limit: $limit) {\n      id\n      rank\n      filmTitle\n      filmYear\n      sequenceNumber\n      scene {\n        context\n        timestampStart\n        timestampEnd\n        intensity\n        location {\n          setting\n          city\n          country\n        }\n      }\n      measurement {\n        distanceFeet\n        durationSeconds\n        confidence\n      }\n      media {\n        youtubeUrl\n        youtubeTimestamp\n      }\n      metadata {\n        behindTheScenes\n      }\n      tags\n      sources {\n        ranking {\n          provider\n          url\n          author\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetFilmStats {\n    filmStats {\n      totalDistanceFeet\n      totalRunningTimeSeconds\n      careerMiles\n    }\n  }\n'
): (typeof documents)['\n  query GetFilmStats {\n    filmStats {\n      totalDistanceFeet\n      totalRunningTimeSeconds\n      careerMiles\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetVisualizationData {\n    yearlyStats {\n      year\n      totalDistanceFeet\n      filmCount\n      films {\n        title\n        totalRunningDistanceFeet\n      }\n    }\n    films(limit: 100) {\n      id\n      title\n      year\n      totalRunningDistanceFeet\n      rottenTomatoesScore\n      cpiScore\n      runningDensity\n      runtimeMinutes\n    }\n  }\n'
): (typeof documents)['\n  query GetVisualizationData {\n    yearlyStats {\n      year\n      totalDistanceFeet\n      filmCount\n      films {\n        title\n        totalRunningDistanceFeet\n      }\n    }\n    films(limit: 100) {\n      id\n      title\n      year\n      totalRunningDistanceFeet\n      rottenTomatoesScore\n      cpiScore\n      runningDensity\n      runtimeMinutes\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetTopRunningFilms($limit: Int) {\n    topRunningFilms(limit: $limit) {\n      id\n      title\n      year\n      totalRunningDistanceFeet\n      rottenTomatoesScore\n    }\n  }\n'
): (typeof documents)['\n  query GetTopRunningFilms($limit: Int) {\n    topRunningFilms(limit: $limit) {\n      id\n      title\n      year\n      totalRunningDistanceFeet\n      rottenTomatoesScore\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetTopCpiFilms($limit: Int) {\n    topCpiFilms(limit: $limit) {\n      id\n      title\n      year\n      totalRunningDistanceFeet\n      rottenTomatoesScore\n      cpiScore\n    }\n  }\n'
): (typeof documents)['\n  query GetTopCpiFilms($limit: Int) {\n    topCpiFilms(limit: $limit) {\n      id\n      title\n      year\n      totalRunningDistanceFeet\n      rottenTomatoesScore\n      cpiScore\n    }\n  }\n'];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
