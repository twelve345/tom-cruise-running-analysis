import { gql } from '@apollo/client';

export const GET_FILM_STATS = gql`
  query GetFilmStats {
    filmStats {
      totalDistanceFeet
      totalRunningTimeSeconds
      careerMiles
    }
  }
`;

export const GET_FILMS = gql`
  query GetFilms($sortBy: FilmSortField, $sortOrder: SortOrder, $filter: FilmFilterInput) {
    films(sortBy: $sortBy, sortOrder: $sortOrder, filter: $filter, limit: 100) {
      id
      title
      year
      runtimeMinutes
      totalRunningDistanceFeet
      totalRunningTimeSeconds
      runningInstancesCount
      runningDensity
      cpiScore
      rottenTomatoesScore
      posterUrl
      imdbId
      tmdbId
      rottenTomatoesUrl
      wikipediaUrl
      youtubeTrailerUrl
      letterboxdUrl
    }
  }
`;

export const GET_VISUALIZATION_DATA = gql`
  query GetVisualizationData {
    yearlyStats {
      year
      totalDistanceFeet
      filmCount
      films {
        title
        totalRunningDistanceFeet
      }
    }
    films(limit: 100) {
      id
      title
      year
      totalRunningDistanceFeet
      rottenTomatoesScore
      cpiScore
      runningDensity
      runtimeMinutes
    }
  }
`;

export const GET_TOP_RUNNING_FILMS = gql`
  query GetTopRunningFilms($limit: Int) {
    topRunningFilms(limit: $limit) {
      id
      title
      year
      totalRunningDistanceFeet
      rottenTomatoesScore
    }
  }
`;

export const GET_TOP_CPI_FILMS = gql`
  query GetTopCpiFilms($limit: Int) {
    topCpiFilms(limit: $limit) {
      id
      title
      year
      totalRunningDistanceFeet
      rottenTomatoesScore
      cpiScore
    }
  }
`;

export const GET_RUNNING_INSTANCES = gql`
  query GetRunningInstances($filmId: Int!, $limit: Int) {
    runningInstances(filmId: $filmId, limit: $limit) {
      id
      rank
      filmTitle
      filmYear
      sequenceNumber
      scene {
        context
        timestampStart
        timestampEnd
        intensity
        location {
          setting
          city
          country
        }
      }
      measurement {
        distanceFeet
        durationSeconds
        confidence
      }
      media {
        youtubeUrl
        youtubeTimestamp
      }
      metadata {
        behindTheScenes
      }
      tags
      sources {
        ranking {
          provider
          url
          author
        }
      }
    }
  }
`;
