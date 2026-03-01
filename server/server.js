const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const authMiddleware = require('./middleware/auth');
const uploadRoutes = require('./routes/upload');
const config = require('./config/config');
const seedDatabase = require('./seed');

const app = express();

// Serve static files
app.use('/images', express.static(path.join(__dirname, 'public/images'), {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

// Upload routes - make sure this is before Apollo Server
app.use('/api/upload', uploadRoutes);

const startServer = async () => {
    try {
        await connectDB();
        console.log('MongoDB connected');

        await seedDatabase();

        const server = new ApolloServer({
            typeDefs,
            resolvers,
            context: ({ req }) => ({ user: req.user }),
            formatError: (err) => {
                console.error('GraphQL Error:', err);
                return {
                    message: err.message,
                    code: err.extensions?.code || 'INTERNAL_SERVER_ERROR'
                };
            }
        });

        await server.start();

        app.use(cors());
        app.use(express.json());
        app.use(authMiddleware);

        server.applyMiddleware({ app, path: '/graphql' });

        app.listen(config.port, () => {
            console.log(` Server running on port ${config.port}`);
            console.log(` GraphQL endpoint: http://localhost:${config.port}${server.graphqlPath}`);
            console.log(` Image URL: http://localhost:${config.port}/images/games/`);
        });
    } catch (error) {
        console.error('！！！ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();