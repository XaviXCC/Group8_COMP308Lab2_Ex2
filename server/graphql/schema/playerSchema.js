const { gql } = require('apollo-server-express');

module.exports = gql`
    type Player {
        id: ID!
        username: String!
        email: String!
        avatarImage: String!
        favoriteGames: [Game!]!
        createdAt: String!
    }

    type AuthPayload {
        token: String!
        player: Player!
    }

    input RegisterInput {
        username: String!
        password: String!
        email: String!
    }

    input LoginInput {
        email: String!
        password: String!
    }

    input UpdateProfileInput {
        username: String
        email: String
        avatarImage: String
        currentPassword: String
        newPassword: String
    }

    type Query {
        me: Player
        getPlayer(id: ID!): Player
        getFavoriteGames: [Game!]!
    }

    type Mutation {
        register(input: RegisterInput!): AuthPayload!
        login(input: LoginInput!): AuthPayload!
        updateProfile(input: UpdateProfileInput!): Player!
        addFavoriteGame(gameId: ID!): Player!
        removeFavoriteGame(gameId: ID!): Player!
    }
`;