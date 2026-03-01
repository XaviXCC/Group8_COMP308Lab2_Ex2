const Player = require('../../models/Player');
const Game = require('../../models/Game');
const { generateToken } = require('../../utils/jwt');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

module.exports = {
    Query: {
        me: async (_, __, { user }) => {
            if (!user) throw new AuthenticationError('Not authenticated');
            const player = await Player.findById(user.id).populate('favoriteGames');
            if (!player) throw new UserInputError('Player not found');

            // Convert MongoDB _id to string id
            const playerObj = player.toObject();
            playerObj.id = player._id.toString();

            // Convert favorite games _id to string id
            playerObj.favoriteGames = playerObj.favoriteGames.map(game => ({
                ...game,
                id: game._id ? game._id.toString() : game.id
            }));

            return playerObj;
        },

        getPlayer: async (_, { id }, { user }) => {
            if (!user) throw new AuthenticationError('Not authenticated');
            const player = await Player.findById(id).populate('favoriteGames');
            if (!player) throw new UserInputError('Player not found');

            const playerObj = player.toObject();
            playerObj.id = player._id.toString();
            playerObj.favoriteGames = playerObj.favoriteGames.map(game => ({
                ...game,
                id: game._id ? game._id.toString() : game.id
            }));

            return playerObj;
        },

        getFavoriteGames: async (_, __, { user }) => {
            if (!user) throw new AuthenticationError('Not authenticated');
            const player = await Player.findById(user.id).populate('favoriteGames');
            if (!player) throw new UserInputError('Player not found');

            // Return favorite games with string ids
            return player.favoriteGames.map(game => {
                const gameObj = game.toObject();
                gameObj.id = game._id.toString();
                return gameObj;
            });
        }
    },

    Mutation: {
        register: async (_, { input }) => {
            const { username, email, password } = input;

            // Check if player already exists
            const existingPlayer = await Player.findOne({
                $or: [{ email }, { username }]
            });

            if (existingPlayer) {
                throw new UserInputError('Player already exists with this email or username');
            }

            // Create new player
            const player = new Player({
                username,
                email,
                password
            });

            await player.save();

            // Format the response
            const playerObj = player.toObject();
            playerObj.id = player._id.toString();
            playerObj.favoriteGames = [];

            // Generate JWT token
            const token = generateToken({
                id: playerObj.id,
                username: playerObj.username,
                email: playerObj.email
            });

            return {
                token,
                player: playerObj
            };
        },

        login: async (_, { input }) => {
            const { email, password } = input;

            // Find player by email
            const player = await Player.findOne({ email }).populate('favoriteGames');
            if (!player) {
                throw new AuthenticationError('Invalid credentials');
            }

            // Check password
            const isValid = await player.comparePassword(password);
            if (!isValid) {
                throw new AuthenticationError('Invalid credentials');
            }

            // Format the response
            const playerObj = player.toObject();
            playerObj.id = player._id.toString();

            // Convert favorite games ids to strings
            playerObj.favoriteGames = playerObj.favoriteGames.map(game => ({
                ...game,
                id: game._id ? game._id.toString() : game.id
            }));

            // Generate JWT token
            const token = generateToken({
                id: playerObj.id,
                username: playerObj.username,
                email: playerObj.email
            });

            return {
                token,
                player: playerObj
            };
        },

        updateProfile: async (_, { input }, { user }) => {
            if (!user) throw new AuthenticationError('Not authenticated');

            const player = await Player.findById(user.id);
            if (!player) {
                throw new UserInputError('Player not found');
            }

            // Handle password change
            if (input.currentPassword && input.newPassword) {
                const isValid = await player.comparePassword(input.currentPassword);
                if (!isValid) {
                    throw new AuthenticationError('Current password is incorrect');
                }
                player.password = input.newPassword;
            }

            // Update other fields
            if (input.username) player.username = input.username;
            if (input.email) player.email = input.email;
            if (input.avatarImage) player.avatarImage = input.avatarImage;

            await player.save();

            // Return updated player with populated favorite games
            const updatedPlayer = await Player.findById(player.id).populate('favoriteGames');
            const playerObj = updatedPlayer.toObject();
            playerObj.id = updatedPlayer._id.toString();

            // Convert favorite games ids to strings
            playerObj.favoriteGames = playerObj.favoriteGames.map(game => ({
                ...game,
                id: game._id ? game._id.toString() : game.id
            }));

            return playerObj;
        },

        addFavoriteGame: async (_, { gameId }, { user }) => {
            if (!user) throw new AuthenticationError('Not authenticated');

            // Find the player
            const player = await Player.findById(user.id);
            if (!player) {
                throw new UserInputError('Player not found');
            }

            // Find the game
            const game = await Game.findById(gameId);
            if (!game) {
                throw new UserInputError('Game not found');
            }

            // Check if game is already in favorites
            if (!player.favoriteGames.includes(gameId)) {
                player.favoriteGames.push(gameId);
                await player.save();
            }

            // Return updated player with populated favorite games
            const updatedPlayer = await Player.findById(player.id).populate('favoriteGames');
            const playerObj = updatedPlayer.toObject();
            playerObj.id = updatedPlayer._id.toString();

            // Safely convert favorite games ids to strings
            playerObj.favoriteGames = (playerObj.favoriteGames || []).map(game => {
                if (!game) return null;
                return {
                    ...game,
                    id: game._id ? game._id.toString() : game.id
                };
            }).filter(g => g !== null); // Remove any null entries

            return playerObj;
        },

        removeFavoriteGame: async (_, { gameId }, { user }) => {
            if (!user) throw new AuthenticationError('Not authenticated');

            // Find the player
            const player = await Player.findById(user.id);
            if (!player) {
                throw new UserInputError('Player not found');
            }

            // Remove game from favorites
            player.favoriteGames = player.favoriteGames.filter(
                id => id.toString() !== gameId
            );

            await player.save();

            // Return updated player with populated favorite games
            const updatedPlayer = await Player.findById(player.id).populate('favoriteGames');
            const playerObj = updatedPlayer.toObject();
            playerObj.id = updatedPlayer._id.toString();

            // Safely convert favorite games ids to strings
            playerObj.favoriteGames = (playerObj.favoriteGames || []).map(game => {
                if (!game) return null;
                return {
                    ...game,
                    id: game._id ? game._id.toString() : game.id
                };
            }).filter(g => g !== null);

            return playerObj;
        }
    }
};