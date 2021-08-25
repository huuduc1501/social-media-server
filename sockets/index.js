const { sendMessage, deleteMessage } = require('./controllers/chat')
const { createGroupConversation, leaveGroupConvesation, removeUser } = require('./controllers/conversation')
const { socketAuth } = require('./middlewares')
const { pushSocketIdToArray, removeSocketIdInArray } = require('./util')

module.exports = (io) => {
    io.use(socketAuth)
    io.on('connection', socket => {
        pushSocketIdToArray(socket)

        socket.on('disconnect', () => {
            removeSocketIdInArray(socket)
        })
        // message
        socket.on('new-message', async (data) => {
            await sendMessage(socket, data)
        })

        socket.on('remove-message', async (data) => {
            await deleteMessage(socket, data)
        })

        // conversation

        socket.on('new-group-conversation', async (data) => {
            await createGroupConversation(socket, data)
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