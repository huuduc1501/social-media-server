const { getMessages, getSingleConversation, getSpecifyConversation } = require('../controllers/conversation')

module.exports = {

    Query: {
        getMessages,
        getSpecifyConversation

    },
    Mutation: {
        getSingleConversation
    },

    Conversation: {

        isReaded: (parent, args, context) => {
            const readedConversation = context.user.conversations
                .find(rC => {
                    if (!rC.conversation) return false
                    return rC._id.toString() === parent._id.toString()
                })
            if (!readedConversation) return false
            return readedConversation.readed
        },
        owner: async (parent, args, context) => {
            const conversation = await parent.populate({ path: 'owner' }).execPopulate()
            return conversation.owner
        },
        members: async (parent, args, context) => {
            await parent.populate({ path: 'members' }).execPopulate()
            return parent.members
        },
        lastMessage: async (parent, args, context) => {
            await parent.populate({ path: 'lastMessage' }).execPopulate()
            return parent.lastMessage
        }
    }
}