const Player = require('../../models/Player');
const Game = require('../../models/Game');
const { generateToken } = require('../../utils/jwt');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

module.exports = {
    Query: {
        me: async (_, __, { user }) => {
            if (!user) throw new AuthenticationError('Not authenticated');
            const player = await Player.findById(user.id).populate('favoriteGames');
            // return player with string ID and populated favorite games
            if (player) {
                player.id = player._id.toString();
            }
            return player;
        },
        getPlayer: async (_, { id }, { user }) => {
            if (!user) throw new AuthenticationError('Not authenticated');
            const player = await Player.findById(id).populate('favoriteGames');
            if (player) {
                player.id = player._id.toString();
            }
            return player;
        },
        getFavoriteGames: async (_, __, { user }) => {
            if (!user) throw new AuthenticationError('Not authenticated');
            const player = await Player.findById(user.id).populate('favoriteGames');
            // return favorite games with string IDs
            return player.favoriteGames.map(game => {
                game.id = game._id.toString();
                return game;
            });
        }
    },
    Mutation: {
        login: async (_, { input }) => {
            const { email, password } = input;

            const player = await Player.findOne({ email }).populate('favoriteGames');
            if (!player) {
                throw new AuthenticationError('Invalid credentials');
            }

            const isValid = await player.comparePassword(password);
            if (!isValid) {
                throw new AuthenticationError('Invalid credentials');
            }

            // return player with string ID and populated favorite games
            const playerObj = player.toObject();
            playerObj.id = player._id.toString();

            const token = generateToken({
                id: playerObj.id,
                username: playerObj.username,
                email: playerObj.email
            });

            return {
                token,
                player: {
                    ...playerObj,
                    favoriteGames: playerObj.favoriteGames.map(game => ({
                        ...game,
                        id: game._id.toString()
                    }))
                }
            };
        },

        register: async (_, { input }) => {
            const { username, email, password } = input;

            const existingPlayer = await Player.findOne({
                $or: [{ email }, { username }]
            });

            if (existingPlayer) {
                throw new UserInputError('Player already exists with this email or username');
            }

            const player = new Player({
                username,
                email,
                password
            });

            await player.save();

            const playerObj = player.toObject();
            playerObj.id = player._id.toString();

            const token = generateToken({
                id: playerObj.id,
                username: playerObj.username,
                email: playerObj.email
            });

            return {
                token,
                player: {
                    ...playerObj,
                    favoriteGames: []
                }
            };
        },

        updateProfile: async (_, { input }, { user }) => {
            if (!user) throw new AuthenticationError('Not authenticated');

            const player = await Player.findById(user.id);
            if (!player) {
                throw new UserInputError('Player not found');
            }

            if (input.currentPassword && input.newPassword) {
                const isValid = await player.comparePassword(input.currentPassword);
                if (!isValid) {
                    throw new AuthenticationError('Current password is incorrect');
                }
                player.password = input.newPassword;
            }

            if (input.username) player.username = input.username;
            if (input.email) player.email = input.email;
            if (input.avatarImage) player.avatarImage = input.avatarImage;

            await player.save();

            const updatedPlayer = await Player.findById(player.id).populate('favoriteGames');
            const playerObj = updatedPlayer.toObject();
            playerObj.id = updatedPlayer._id.toString();

            return {
                ...playerObj,
                favoriteGames: playerObj.favoriteGames.map(game => ({
                    ...game,
                    id: game._id.toString()
                }))
            };
        },

        addFavoriteGame: async (_, { gameId }, { user }) => {
            if (!user) throw new AuthenticationError('Not authenticated');

            const player = await Player.findById(user.id);
            const game = await Game.findById(gameId);

            if (!game) {
                throw new UserInputError('Game not found');
            }

            if (!player.favoriteGames.includes(gameId)) {
                player.favoriteGames.push(gameId);
                await player.save();
            }

            const updatedPlayer = await Player.findById(player.id).populate('favoriteGames');
            const playerObj = updatedPlayer.toObject();
            playerObj.id = updatedPlayer._id.toString();

            return {
                ...playerObj,
                favoriteGames: playerObj.favoriteGames.map(game => ({
                    ...game,
                    id: game._id.toString()
                }))
            };
        },

        removeFavoriteGame: async (_, { gameId }, { user }) => {
            if (!user) throw new AuthenticationError('Not authenticated');

            const player = await Player.findById(user.id);

            player.favoriteGames = player.favoriteGames.filter(
                id => id.toString() !== gameId
            );

            await player.save();

            const updatedPlayer = await Player.findById(player.id).populate('favoriteGames');
            const playerObj = updatedPlayer.toObject();
            playerObj.id = updatedPlayer._id.toString();

            return {
                ...playerObj,
                favoriteGames: playerObj.favoriteGames.map(game => ({
                    ...game,
                    id: game._id.toString()
                }))
            };
        }
    }
};