const { gql } = require('apollo-server-express');
const playerSchema = require('./playerSchema');
const gameSchema = require('./gameSchema');

const baseSchema = gql`
    type Query {
        _empty: String
    }

    type Mutation {
        _empty: String
    }
`;

module.exports = [baseSchema, playerSchema, gameSchema];