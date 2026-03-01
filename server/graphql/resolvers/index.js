const playerResolver = require('./playerResolver');
const gameResolver = require('./gameResolver');

module.exports = {
    Query: {
        ...playerResolver.Query,
        ...gameResolver.Query
    },
    Mutation: {
        ...playerResolver.Mutation,
        ...gameResolver.Mutation
    }
};