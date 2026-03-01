const { verifyToken } = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization || '';

    if (token) {
        try {
            const user = verifyToken(token.replace('Bearer ', ''));
            req.user = user;
        } catch (error) {
            console.log('Invalid token');
        }
    }

    next();
};

module.exports = authMiddleware;