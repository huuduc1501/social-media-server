const { signup,
    signin,
    me,
    follow,
    unfollow,
    getProfile,
    editProfile,
    feed,
    getConversations,
    suggestUsers,
    searchUsers,
    validateEmail,
    validateUsername } = require('../controllers/user')

module.exports = {
    Query: {
        getProfile,
        me,
        feed,
        suggestUsers,
        searchUsers,
        getConversations,

    },
    Mutation: {
        signup,
        signin,
        follow,
        unfollow,
        editProfile,
        validateEmail,
        validateUsername,
    },
    User: {
        isMe: (parent, args, context) => {
            return parent._id.toString() === context.user._id.toString()
        },
        posts: async (parent, args, context) => {
            const user = await parent.populate({ path: 'posts' }).execPopulate()
            return user.posts
        },
        savedPosts: async (parent, args, context) => {
            const user = await parent.populate({ path: 'savedPosts', }).execPopulate()
            return user.savedPosts
        },
        followers: async (parent, args, context) => {
            const user = await parent.populate({ path: 'followers' }).execPopulate()
            return user.followers
        },
        followings: async (parent, args, context) => {
            const user = await parent.populate({ path: 'followings' }).execPopulate()
            return user.followings
        },
        isFollowing: async (parent, args, context) => {
            return context.user.followings.includes(parent._id)
        },
    }
}