require('dotenv').config()
const express = require('express');

const app = express()

const { ApolloServer } = require('apollo-server-express')
const mongoose = require('mongoose')
const cloudinary = require('cloudinary').v2
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer, {
    cors: {
        origin: '*'
    },
    path: '/chat',

})

const initSocket = require('./sockets/index')

// initsocket
initSocket(io)
// io.listen(httpServer)

const typeDefs = require('./schemas/index')
const resolvers = require('./resolvers/index');

const { authByToken } = require('./controllers/user');

// connect mongoDb
console.log(process.env.MONGODB_URL);

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


server.applyMiddleware({ app })

const port = process.env.PORT || 5000

httpServer.listen(port, () => {
    console.log(`App listening on http://localhost:${port}${server.graphqlPath}`)
})