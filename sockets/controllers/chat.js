const User = require('../../models/User')
const Message = require('../../models/Message')
const Conversation = require('../../models/Conversation')
const { emitToUser } = require('../util')

exports.sendMessage = async (io, socket, data) => {
    console.log('send message')

    const conversation = await Conversation.findById(data.conversationId)

    if (!conversation)
        return socket.emit('chat-error', 'không tìm thấy cuộc nói chuyện!')
    const message = await Message.create({
        sender: socket.user._id,
        conversation: conversation._id,
        message: data.message,
        type: data.type,
        images: data.images,
        file: data.file
    })
    await message.populate({ path: 'sender', select: '_id username avatar fullname' }).execPopulate()

    if (!conversation.lastMessage) {
        conversation.members.forEach(async userId => await User.findOneAndUpdate({ _id: userId }, {
            $addToSet: { conversations: { conversation: conversation._id } }
        }))
    }
    conversation.members.forEach(userId => {
        emitToUser(userId, io, `new-message`, message)
    })
    conversation.updateOne({
        lastMessage: message._id
    })
    return
}

exports.deleteMessage = async (socket, { messageId }) => {
    const message = await Message.findById(messageId).populate({ path: 'conversation', select: '_id members' })
    if (!message) return
    if (socket.user._id.toString() !== message.sender.toString())
        return socket.emit('remove-error', 'bạn không có quyền xóa tin nhắn của người khác!')
    await message.remove()
    message.conversation.members.forEach(userId => {
        emitToUser(userId, socket, `remove-message:${message.conversation._id}`,)
    })
}