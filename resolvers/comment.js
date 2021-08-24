const { addComment, deleteComment } = require('../controllers/comment')


module.exports = {
    Mutation: {
        addComment,
        deleteComment,
    },
    Comment: {
        user: async (parent, args, context) => {
            const comment = await parent.populate({ path: 'user' }).execPopulate()
            return comment.user
        },
        post: async (parent, args, context) => {
            const comment = await parent.populate({ path: 'post' })
            return comment.post
        },
        isMine: (parent, args, context) => {
            return parent.user.toString() === context.user._id.toString()
        }
    }
}