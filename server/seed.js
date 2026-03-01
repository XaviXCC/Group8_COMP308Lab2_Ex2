const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Game = require('./models/Game');
const Player = require('./models/Player');

const seedGames = [
    {
        gameId: 'G001',
        title: 'The Last of Us Part II',
        genre: 'Action',
        platform: 'PlayStation 5',
        releaseYear: 2020,
        description: 'An action-adventure game set in a post-apocalyptic world. Follow Ellie on her journey through a dangerous America.',
        coverImage: '/images/games/last-of-us.jpg'
    },
    {
        gameId: 'G002',
        title: 'Cyberpunk 2077',
        genre: 'RPG',
        platform: 'PC',
        releaseYear: 2020,
        description: 'An open-world RPG set in a futuristic metropolis. Customize your character and explore the massive Night City.',
        coverImage: '/images/games/cyberpunk.jpg'
    },
    {
        gameId: 'G003',
        title: 'FIFA 24',
        genre: 'Sports',
        platform: 'Xbox Series X',
        releaseYear: 2023,
        description: 'The latest installment in the FIFA football series with enhanced gameplay and graphics.',
        coverImage: '/images/games/fifa24.jpg'
    },
    {
        gameId: 'G004',
        title: 'Zelda: Tears of the Kingdom',
        genre: 'Adventure',
        platform: 'Nintendo Switch',
        releaseYear: 2023,
        description: 'An epic adventure in the land of Hyrule. Explore the skies and uncover dark secrets.',
        coverImage: '/images/games/zelda.jpg'
    },
    {
        gameId: 'G005',
        title: 'Starfield',
        genre: 'RPG',
        platform: 'PC',
        releaseYear: 2023,
        description: 'An epic space exploration RPG from Bethesda. Explore over 1000 planets across the galaxy.',
        coverImage: '/images/games/starfield.jpg'
    },
    {
        gameId: 'G006',
        title: 'God of War Ragnarök',
        genre: 'Action',
        platform: 'PlayStation 5',
        releaseYear: 2022,
        description: 'Kratos and Atreus journey through the Nine Realms in search of answers.',
        coverImage: '/images/games/god-of-war.jpg'
    },
    {
        gameId: 'G007',
        title: 'Elden Ring',
        genre: 'RPG',
        platform: 'PC',
        releaseYear: 2022,
        description: 'A challenging action RPG set in the Lands Between.',
        coverImage: '/images/games/elden-ring.jpg'
    },
    {
        gameId: 'G008',
        title: 'Minecraft',
        genre: 'Adventure',
        platform: 'PC',
        releaseYear: 2011,
        description: 'A sandbox game where you can build anything you can imagine.',
        coverImage: '/images/games/minecraft.jpg'
    }
];

const seedDatabase = async () => {
    try {
        // check if games already exist to prevent duplicate seeding
        const gameCount = await Game.countDocuments();

        if (gameCount === 0) {
            await Game.insertMany(seedGames);
            console.log(`✅ Seeded ${seedGames.length} games successfully`);
        } else {
            console.log(`⚠️ Database already has ${gameCount} games, skipping seed`);
        }

        // check if test user already exists to prevent duplicate seeding
        const userCount = await Player.countDocuments();

        if (userCount === 0) {
            const testPlayer = new Player({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });
            await testPlayer.save();
            console.log('✅ Test user created: test@example.com / password123');
        }
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
};

module.exports = seedDatabase;