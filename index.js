require('dotenv').config()
const express = require('express');
const { ApolloServer } = require('apollo-server-express')
const mongoose = require('mongoose')
const cloudinary = require('cloudinary').v2

const typeDefs = require('./schemas/index')
const resolvers = require('./resolvers/index');

const { authByToken } = require('./controllers/user');

// connect mongoDb

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        })
        console.log('MongoDB connected')
    } catch (error) {
        console.error(error.message)
        process.exit(1)
    }
})()

// config cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
})

const myPlugin = {
    // Fires whenever a GraphQL request is received from a client.
    async requestDidStart(requestContext) {
        console.log('Request started! Query:\n' +
            requestContext.request.query);

        return {
            // Fires whenever Apollo Server will parse a GraphQL
            // request to create its associated document AST.
            async parsingDidStart(requestContext) {
                console.log('Parsing started!');
            },

            // Fires whenever Apollo Server will validate a
            // request's document AST against your GraphQL schema.
            async validationDidStart(requestContext) {
                console.log('Validation started!');
            },

        }
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        let token
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }

        const user = await authByToken(token)
        console.log('query from client')
        return { user }
    },
    // plugins: [myPlugin]
})

const app = express()

server.applyMiddleware({ app })

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}${server.graphqlPath}`)
})