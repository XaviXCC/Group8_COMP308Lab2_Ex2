const { gql } = require('apollo-server-express');

module.exports = gql`
    type Game {
        id: ID!
        gameId: String!
        title: String!
        genre: String!
        platform: String!
        releaseYear: Int!
        description: String
        coverImage: String!
        createdAt: String!
    }

    input GameInput {
        gameId: String!
        title: String!
        genre: String!
        platform: String!
        releaseYear: Int!
        description: String
        coverImage: String
    }

    input GameFilter {
        title: String
        genre: String
        platform: String
    }

    type Query {
        games(filter: GameFilter): [Game!]!
        game(id: ID!): Game
        searchGames(term: String!): [Game!]!
    }

    type Mutation {
        createGame(input: GameInput!): Game!
        updateGame(id: ID!, input: GameInput!): Game!
        deleteGame(id: ID!): Boolean!
    }
`;