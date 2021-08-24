const { createPost, getPost, deletePost, toggleLike, toggleSave, suggestPosts } = require('../controllers/post')


module.exports = {
    Query: {
        getPost,
        suggestPosts
    },
    Mutation: {
        createPost,
        toggleLike,
        toggleSave,
        deletePost,
    },
    Post: {
        user: async (parent, args, context) => {
            const post = await parent
                .populate({ path: "user", select: "-password" })
                .execPopulate()

            return post.user
        },
        likes: async (parent, args, context) => {

            const post = await parent
                .populate({ path: "likes", select: "-password" })
                .execPopulate()

            return post.likes
        },
        isLiked: (parent, args, context) => {
            return parent.likes.includes(context.user._id)
        },
        isSaved: (parent, args, context) => {
            return context.user.savedPosts.includes(parent._id)
        },
        isMine: (parent, args, context) => {
            return parent.user.toString() === context.user._id.toString()
        },
        comments: async (parent, args, context) => {
            const post = await parent.populate({ path: "comments" }).execPopulate()
            return post.comments
        }
    }
}