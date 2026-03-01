const Game = require('../../models/Game');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

module.exports = {
    Query: {
        games: async (_, { filter = {} }) => {
            const query = {};
            if (filter.title) query.title = new RegExp(filter.title, 'i');
            if (filter.genre) query.genre = filter.genre;
            if (filter.platform) query.platform = filter.platform;

            return await Game.find(query).sort({ title: 1 });
        },

        game: async (_, { id }) => {
            const game = await Game.findById(id);
            if (!game) {
                throw new UserInputError('Game not found');
            }
            return game;
        },

        searchGames: async (_, { term }) => {
            return await Game.find({
                $or: [
                    { title: new RegExp(term, 'i') },
                    { genre: new RegExp(term, 'i') },
                    { platform: new RegExp(term, 'i') }
                ]
            }).sort({ title: 1 });
        }
    },

    Mutation: {
        createGame: async (_, { input }, { user }) => {
            if (!user) throw new AuthenticationError('Not authenticated');

            const existingGame = await Game.findOne({ gameId: input.gameId });
            if (existingGame) {
                throw new UserInputError('Game with this ID already exists');
            }

            const game = new Game(input);
            await game.save();
            return game;
        },

        updateGame: async (_, { id, input }, { user }) => {
            if (!user) throw new AuthenticationError('Not authenticated');

            const game = await Game.findByIdAndUpdate(
                id,
                { ...input },
                { new: true, runValidators: true }
            );

            if (!game) {
                throw new UserInputError('Game not found');
            }

            return game;
        },

        deleteGame: async (_, { id }, { user }) => {
            if (!user) throw new AuthenticationError('Not authenticated');

            const result = await Game.findByIdAndDelete(id);
            if (!result) {
                throw new UserInputError('Game not found');
            }

            return true;
        }
    }
};