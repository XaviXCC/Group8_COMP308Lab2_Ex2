const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    gameId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    genre: {
        type: String,
        required: true,
        enum: ['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Racing', 'Puzzle', 'Simulation', 'FPS', 'Other']
    },
    platform: {
        type: String,
        required: true,
        enum: ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X', 'Xbox One', 'Nintendo Switch', 'Mobile', 'Other']
    },
    releaseYear: {
        type: Number,
        required: true,
        min: 1950,
        max: new Date().getFullYear() + 2
    },
    description: {
        type: String,
        maxlength: 500
    },
    coverImage: {
        type: String,
        default: 'default-game.jpg'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Game', gameSchema);