const User = require('../models/User')
const Post = require('../models/Post')

const jwt = require('jsonwebtoken')

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
    console.log(isExact)
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

    const user = await User.findById(context.user._id).select('-password')

    return user
}

exports.searchUsers = async (parent, { searchTerm }, context) => {
    if (!searchTerm) return new Error('vui lòng nhập tên')

    const regex = new RegExp(searchTerm, 'i')
    const users = await User.find({ username: regex })

    return users
}

exports.feed = async (parent, args, context) => {

    const userIds = context.user.followings.concat([context.user._id])
    const posts = await Post.find({ user: { $in: userIds } })
        .sort('-createdAt')
        .limit(50)

    return posts
}

exports.suggestUsers = async (parent, args, context) => {
    const userIds = context.user.followings.concat([context.user._id])
    const users = await User.find({ _id: { $nin: userIds } }).limit(10)
    return users
}

exports.authByToken = async (token) => {
    if (!token) return new Error('invalid')
    const decode = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decode.id)
    if (!user) return new Error('invalid')

    return user
}