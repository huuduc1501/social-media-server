const Conversation = require('../../models/Conversation')
const User = require('../../models/User')
const { emitToUser } = require('../util')

exports.createConversation = async (io, socket, data) => {
    console.log(data.members)

    let memberList = []

    for (let i = 0; i < data.members.length; i++) {
        const user = await User.findById(data.members[i])
        if (user) {

            memberList.push(user)
        }
    }

    memberList.push(socket.user)

    console.log(memberList.map(user => user._id.toString()))
    const conversation = await Conversation.create({
        type: data.type,
        owner: socket.user._id,
        members: memberList.map(user => user._id),
        title: data.title
    })

    memberList.forEach(user => {
        emitToUser(user._id, io, 'new-conversation', conversation)
    })
    // await socket.user.updateOne({
    //     $addToSet: { conversations: conversation._id }
    // })
    memberList.forEach(async user => await user.updateOne({
        $addToSet: { conversations: { conversation: conversation._id } }
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
