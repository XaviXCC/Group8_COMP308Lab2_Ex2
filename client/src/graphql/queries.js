import { gql } from '@apollo/client';

// Auth mutations
export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      player {
        id
        username
        email
        avatarImage
        favoriteGames {
          id
          title
        }
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      player {
        id
        username
        email
        avatarImage
        favoriteGames {
          id
          title
        }
      }
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      username
      email
      avatarImage
      favoriteGames {
        id
        title
      }
    }
  }
`;

// Game queries
export const GET_GAMES = gql`
  query GetGames {
    games {
      id
      gameId
      title
      genre
      platform
      releaseYear
      description
      coverImage
    }
  }
`;

export const GET_GAME = gql`
  query GetGame($id: ID!) {
    game(id: $id) {
      id
      gameId
      title
      genre
      platform
      releaseYear
      description
      coverImage
    }
  }
`;

export const SEARCH_GAMES = gql`
  query SearchGames($term: String!) {
    searchGames(term: $term) {
      id
      title
      genre
      platform
      releaseYear
      coverImage
    }
  }
`;

// Player queries
export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
      avatarImage
      favoriteGames {
        id
        title
        genre
        platform
        coverImage
      }
    }
  }
`;

export const GET_FAVORITE_GAMES = gql`
  query GetFavoriteGames {
    getFavoriteGames {
      id
      title
      genre
      platform
      releaseYear
      coverImage
    }
  }
`;

// Favorite mutations
export const ADD_FAVORITE_GAME = gql`
  mutation AddFavoriteGame($gameId: ID!) {
    addFavoriteGame(gameId: $gameId) {
      id
      favoriteGames {
        id
        title
      }
    }
  }
`;

export const REMOVE_FAVORITE_GAME = gql`
  mutation RemoveFavoriteGame($gameId: ID!) {
    removeFavoriteGame(gameId: $gameId) {
      id
      favoriteGames {
        id
        title
      }
    }
  }
`;

export const CREATE_GAME = gql`
  mutation CreateGame($input: GameInput!) {
    createGame(input: $input) {
      id
      gameId
      title
      genre
      platform
      releaseYear
      description
      coverImage
    }
  }
`;