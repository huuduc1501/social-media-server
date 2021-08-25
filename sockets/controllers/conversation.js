const Conversation = require('../../models/Conversation')
const User = require('../../models/User')
const { emitToUser } = require('../util')

exports.createGroupConversation = async (socket, data) => {

    const members = []
    members = data.members.map(userId => {
        const user = await User.findById(userId)
        if (!user || user._id === socket.user._id.toString()) return
        return user
    })
    const conversation = await Conversation.create({
        owner: socket.user._id,
        members: memers.map(user => user._id),
        title: data.title
    })

    members.forEach(userId => {
        emitToUser(userId, socket, 'new-conversation', conversation)
    })
    await socket.user.updateOne({
        $addToSet: { conversations: conversation._id }
    })
    members.map(async user => await user.updateOne({
        $addToSet: { conversations: conversation._id }
    }))
    return
}

exports.leaveGroupConvesation = async (socket, { conversationId }) => {
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) return
    if (conversation.type === 'single') return
    if (conversation.owner.toString() !== socket.user._id)
        return new Error('bạn không thể rời nhóm khi đang làm chủ!')
    await conversation.updateOne({
        $pull: { members: socket.user._id }
    })
    await socket.user.updateOne({
        $pull: { conversations: conversation._id }
    })

    const message = await Message.create({
        message: `${socket.user.fullname} đã rời khỏi phòng`
    })
    conversation.members.forEach(userId => {
        emitToUser(userId, socket, 'user-leave-group', message)
    })

}

exports.addMember = async (socket, { userId, conversationId }) => {
    const user = await User.findById(userId).select('_id username fullname avatar')
    if (!user) return
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) return
    await conversation.updateOne({
        $addToSet: { members: userId }
    })
    const message = await Message.create({
        type: 'notification',
        message: `${socket.user.fullname} đã thêm ${user.fullname} vào nhóm`
    })
    conversation.members.forEach(uId => {
        emitToUser(uId, socket, `add-member:${conversation._id}`, message)
    })
    await user.updateOne({
        $addToSet: { conversation: conversation._id }
    })
}

exports.removeUser = async (socket, { userId, conversationId }) => {
    const user = await User.findById(userid).select('_id username fullname avatar')
    if (!user) return
    const conversation = await Conversation.findById(conversationId)
    await conversation.updateOne({
        $pull: { member: user._id }
    })
    await user.updateOne({
        $pull: { conversations: conversation._id }
    })
    const message = await Message.create({
        type: 'notification',
        message: `${socket.user.fullname} đã xóa ${user.fullname} ra khỏi phòng`
    })
    conversation.members.forEach(uId => {
        emitToUser(uId, socket, `remove-member:${conversation._id}`, message)
    })
}
