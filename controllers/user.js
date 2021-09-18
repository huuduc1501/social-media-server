const User = require('../models/User')
const Post = require('../models/Post')
const cloudinary = require('cloudinary').v2

const jwt = require('jsonwebtoken')
const Conversation = require('../models/Conversation')
const user = require('../schemas/user')

exports.signup = async (parent, { email, password, fullname, username }, context) => {

    const user = await User.create({ email, password, fullname, username });
    const token = user.getJwtToken()
    return { token }

}

exports.signin = async (parent, { email, password }, context) => {
    const user = await User.findOne({ email })
    if (!user) {
        return new Error('Không tồn tại email!')
    }
    const isExact = await user.checkPassword(password)
    if (isExact) {
        const token = user.getJwtToken()
        return { token }
    }
    else {
        return new Error('Không đúng mật khẩu!')
    }
}

exports.me = async (parent, args, context) => {
    return context.user
}

exports.follow = async (parent, { userId }, context) => {

    if (!context.user.followings.includes(userId)) {
        await User.findByIdAndUpdate(userId, {
            $addToSet: {
                followers: context.user._id
            },
            $inc: {
                followersCount: 1
            }
        })

        await context.user.updateOne({
            $addToSet: {
                followings: userId
            },
            $inc: {
                followingsCount: 1
            }
        })
    }

    return true
}

exports.unfollow = async (parent, { userId }, context) => {

    if (context.user.followings.includes(userId)) {
        await User.findByIdAndUpdate(userId, {
            $pull: {
                followers: context.user._id
            },
            $inc: {
                followersCount: -1
            }
        })

        await context.user.updateOne({
            $pull: {
                followings: userId
            },
            $inc: {
                followingsCount: -1
            }
        })

    }

    return true
}

exports.getProfile = async (parent, { userId }, context) => {
    const user = await User.findById(userId).select('-password')
    if (!user) return new Error('User not found')
    return user
}

exports.editProfile = async (parent, { avatar, username, fullname, bio, email }, context) => {
    const updateField = {}

    if (avatar) updateField.avatar = avatar
    if (username) updateField.username = username
    if (fullname) updateField.fullname = fullname
    if (bio) updateField.bio = bio
    if (email) updateField.email

    await context.user.updateOne({
        $set: {
            ...updateField
        }
    }, {
        runValidators: true,
    })

    // if (user.avatar.toString() !== avatar) {
    //     let publicId = user.avatar.split('/').pop()
    //     publicId = publicId.split('.')[0]

    //     cloudinary.uploader.destroy(publicId, function (result) {
    //         console.log(result)
    //     })

    // }

    const user = await User.findById(context.user._id).select('-password')

    return user
}

exports.searchUsers = async (parent, { searchTerm }, context) => {
    if (!searchTerm) return new Error('vui lòng nhập tên')

    const regex = new RegExp(searchTerm, 'i')
    const users = await User.find({ username: regex }).limit(7)

    return users
}

exports.feed = async (parent, { cursor, limit }, context) => {
    let posts = []

    const userIds = context.user.followings.concat([context.user._id])

    if (cursor) {
        const time = new Date(parseInt(cursor))
        posts = await Post.find({
            $and: [
                {
                    createdAt: {
                        $lte: time
                    }
                },
                {
                    user: {
                        $in: userIds
                    }
                }
            ]
        }).sort('-createdAt').limit(limit + 1)
    }
    else {
        posts = await Post.find({ user: { $in: userIds } })
            .sort('-createdAt')
            .limit(limit + 1)

    }

    const hasMore = posts.length === limit + 1
    let nextCursor = null
    if (hasMore) {
        nextCursor = posts.pop().createdAt
    }

    return { paging: { hasMore, nextCursor }, posts }
}

exports.suggestUsers = async (parent, args, context) => {
    const userIds = context.user.followings.concat([context.user._id])
    const users = await User.find({ _id: { $nin: userIds } }).limit(5)
    return users
}

exports.authByToken = async (token) => {
    if (!token) return null
    const decode = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decode.id)
    if (!user) return new Error('invalid')

    return user
}

// validate signup 

exports.validateEmail = async (parent, { email }, context) => {
    const user = await User.findOne({ email })
    if (!user) return true
    return false
}

exports.validateUsername = async (parent, { username }, context) => {
    const user = await User.findOne({ username })
    if (!user) return true
    return false
}


// conversation

exports.getConversations = async (parent, { cursor, limit }, context) => {
    await context.user.populate({
        path: 'conversations',
        populate: [{
            path: 'conversation', model: 'Conversation',
            // options: { sort: { 'updatedAt': 1 } }
        }],

    }).execPopulate()
    const conversations = context.user.conversations.map(readedConversation => readedConversation.conversation)
    return { paging: { hasMore: false, nextCursor: null }, conversations }
}