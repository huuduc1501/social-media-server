const { getMessages, getSingleConversation } = require('../controllers/conversation')

module.exports = {

    Query: {
        getMessages
    },
    Mutation: {
        getSingleConversation
    },

    Conversation: {

        isReaded: (parent, args, context) => {
            const readedConversation = context.user.conversations
                .find(rC => {
                    if (!rC.conversation) return false
                    console.log(rC.conversation._id.toString() === parent._id.toString())
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