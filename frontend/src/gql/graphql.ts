/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type FilmFilterInput = {
  maxCpi?: number | null | undefined;
  maxDistance?: number | null | undefined;
  maxYear?: number | null | undefined;
  minCpi?: number | null | undefined;
  minDistance?: number | null | undefined;
  minRottenTomatoes?: number | null | undefined;
  minYear?: number | null | undefined;
};

export type FilmSortField =
  | 'cpiScore'
  | 'rottenTomatoesScore'
  | 'runningInstancesCount'
  | 'runtimeMinutes'
  | 'title'
  | 'totalRunningDistanceFeet'
  | 'year';

export type SortOrder = 'ASC' | 'DESC';

export type GetFilmsQueryVariables = Exact<{
  sortBy?: FilmSortField | null | undefined;
  sortOrder?: SortOrder | null | undefined;
  filter?: FilmFilterInput | null | undefined;
}>;

export type GetFilmsQuery = {
  films: Array<{
    id: string;
    title: string;
    year: number;
    runtimeMinutes: number | null;
    totalRunningDistanceFeet: number;
    totalRunningTimeSeconds: number;
    runningInstancesCount: number;
    runningDensity: number | null;
    cpiScore: number | null;
    rottenTomatoesScore: number | null;
    posterUrl: string | null;
    imdbId: string | null;
    tmdbId: number | null;
    rottenTomatoesUrl: string | null;
    wikipediaUrl: string | null;
    youtubeTrailerUrl: string | null;
    letterboxdUrl: string | null;
  }>;
};

export type GetRunningInstancesQueryVariables = Exact<{
  filmId: number;
  limit?: number | null | undefined;
}>;

export type GetRunningInstancesQuery = {
  runningInstances: Array<{
    id: string;
    rank: number;
    filmTitle: string;
    filmYear: number;
    sequenceNumber: number | null;
    tags: Array<string> | null;
    scene: {
      context: string;
      timestampStart: string | null;
      timestampEnd: string | null;
      intensity: string | null;
      location: { setting: string | null; city: string | null; country: string | null } | null;
    };
    measurement: {
      distanceFeet: number | null;
      durationSeconds: number | null;
      confidence: string | null;
    } | null;
    media: { youtubeUrl: string | null; youtubeTimestamp: string | null } | null;
    metadata: { behindTheScenes: string | null } | null;
    sources: { ranking: { provider: string; url: string | null; author: string | null } };
  }>;
};

export type GetFilmStatsQueryVariables = Exact<{ [key: string]: never }>;

export type GetFilmStatsQuery = {
  filmStats: { totalDistanceFeet: number; totalRunningTimeSeconds: number; careerMiles: number };
};

export type GetVisualizationDataQueryVariables = Exact<{ [key: string]: never }>;

export type GetVisualizationDataQuery = {
  films: Array<{
    id: string;
    title: string;
    year: number;
    totalRunningDistanceFeet: number;
    rottenTomatoesScore: number | null;
    cpiScore: number | null;
    runningDensity: number | null;
    runtimeMinutes: number | null;
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
