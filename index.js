require('dotenv').config()
const express = require('express');
const { ApolloServer } = require('apollo-server-express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const typeDefs = require('./schemas/index')
const resolvers = require('./resolvers/index');
const dbMethods = require('./controllers/index')

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
    }
})

const app = express()

server.applyMiddleware({ app })

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}${server.graphqlPath}`)
})