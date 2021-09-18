const { sendMessage, deleteMessage } = require('./controllers/chat')
const { createConversation, leaveGroupConvesation, removeUser } = require('./controllers/conversation')
const { socketAuth } = require('./middlewares')
const { pushSocketIdToArray, removeSocketIdInArray, emitToUser } = require('./util')

module.exports = (io) => {
    io.use(socketAuth)
    io.on('connection', socket => {
        console.log('client connect')
        pushSocketIdToArray(socket)

        socket.on('disconnect', () => {
            console.log('disconnect')
            removeSocketIdInArray(socket)
        })

        socket.emit('test-1', 'helo')
        // message
        socket.on('new-message',  (data) => {
            sendMessage(io,socket, data)
        })

        socket.on('remove-message', async (data) => {
            await deleteMessage(socket, data)
        })

        // conversation
        emitToUser(socket.user._id, io, 'test2', 'heheh')
        socket.on('new-conversation', (data) => {
            createConversation(io,socket,  data)
        })

        socket.on('leave-group-conversation,', async data => {
            await leaveGroupConvesation(socket, data)
        })

        socket.on('add-group-member', async data => {
            await addMember(socket, data)
        })

        socket.on('remove-group-member', async data => {
            await removeUser(socket, data)
        })
    })
}