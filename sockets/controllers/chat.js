const User = require('../../models/User')
const Message = require('../../models/Message')
const Conversation = require('../../models/Conversation')
const { emitToUser } = require('../util')

exports.sendMessage = async (socket, data) => {
    const conversation = await Conversation.findById(data.conversationId)
    if (!conversation)
        return socket.emit('chat-error', 'không tìm thấy cuộc nói chuyện!')
    const message = await Message.create({
        sender: socket.user._id,
        conversation: data.conversaion,
        messages: data.message,
        type: data.type,
        images: data.images,
        file: data.file
    })
    message.sender = {
        _id: socket.user._id,
        username: socket.user.username,
        avatar: socket.user.avatar,
        fullname: socket.user.fullname
    }
    conversation.members.forEach(userId => {
        emitToUser(userId, socket, `new-message:${conversation._id}`, message)
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