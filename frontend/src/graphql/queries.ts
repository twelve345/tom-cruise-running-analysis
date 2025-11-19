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
      totalRunningDistanceFeet
      rottenTomatoesScore
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
    }
  }
`;
