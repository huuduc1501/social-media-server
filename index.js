require('dotenv').config()
const express = require('express');

const app = express()

const { ApolloServer } = require('apollo-server-express')
const mongoose = require('mongoose')
const cloudinary = require('cloudinary').v2
const httpServer = require('http').createServer(app)
const multer = require('multer')
const path = require('path')
const cors = require('cors')
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

// upload file

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype.includes('image')) {
            cb(null, './public/uploads/images')

        } else {
            cb(null, './public/uploads/files')

        }
    },
    filename: (req, file, cb) => {
        const storageFileName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
        cb(null, storageFileName)
    }
})

const upload = multer({ storage })

// middleware and router

app.use(express.json())
app.use(cors())

app.use('/public',express.static('public'))

app.post('/upload', upload.fields([{ name: 'image', maxCount: 8 }, { name: 'file', maxCount: 3 }]), (req, res, next) => {
    const response = []
    if (req.files['image'])
        req.files['image'].forEach(file => response.push({ path: file.path, name: file.originalname }))
    if (req.files['file'])
        req.files['file'].forEach(file => response.push({ path: file.path, name: file.originalname }))
    res.send(response)
})

const port = process.env.PORT || 5000

httpServer.listen(port, () => {
    console.log(`App listening on http://localhost:${port}${server.graphqlPath}`)
})