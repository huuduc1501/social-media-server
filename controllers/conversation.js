const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const User = require('../models/User')

exports.getSingleConversation = async (parent, { userId }, context) => {

    const user = await User.findById(userId)

    if (!user) return new Error('Không tìm thấy người dùng!')

    let conversation = await Conversation.findOne({
        type: 'single', member: { $size: 2, $all: [userId, context.user._id] }
    })

    if (!conversation) {
        conversation = await Conversation.create({
            type: 'single',
            member: [userId, context.user._id],
            owner: context.user._id
        })
    }
    return conversation
}

exports.getMessages = async (parent, { conversationId, cursor, limit }, context) => {
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) return new Error('không có cuộc trò chuyện này!')

    if (!conversation.members.includes(context.user._id))
        return new Error('Bạn không có quyền truy cập!')

    let messages = []

    if (cursor) {
        const time = new Date(cursor)
        messages = await Message.find({
            $and: [{
                createdAt: {
                    $lte: time
                },
                conversation: conversationId
            }]
        }).limit(limit + 1)
    } else {
        messages = await Message.find({
            conversation: conversationId
        }).limit(limit + 1)
    }

    let nextCursor = null
    let hasMore = messages.length === limit + 1
    if (hasMore) {
        nextCursor = messages.pop().createdAt
    }

    return { paging: { hasMore, nextCursor }, messages }
}