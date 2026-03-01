const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    port: process.env.PORT || 5000,
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/gaming_system',
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    jwtExpiration: process.env.JWT_EXPIRE || '7d'
};