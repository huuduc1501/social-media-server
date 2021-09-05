module.exports = {
    Message: {
        sender: async (parent, args, context) => {
            await parent.populate({ path: 'sender' }).execPopulate()
            return parent.sender
        },
        isMine: (parent, args, context) => {
            return context.user._id.toString() === parent.sender.toString()
        }
    }
}