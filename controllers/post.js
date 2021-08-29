const Post = require('../models/Post')
const User = require('../models/User')
const cloudinary = require('cloudinary').v2


exports.suggestPosts = async (parent, { cursor, limit }, context) => {
    let posts = []
    if (cursor) {
        let time = new Date(parseInt(cursor))
        posts = await Post.find({ createdAt: { $lte: time } }).sort('-createdAt').limit(limit + 1)
    } else {
        posts = await Post.find().sort('-createdAt').limit(limit + 1)
    }

    let nextCursor = null
    const hasMore = posts.length === limit + 1
    if (hasMore) {
        nextCursor = posts.pop().createdAt
    }

    return { paging: { hasMore, nextCursor }, posts }
}

exports.createPost = async (parent, { caption, files, tags }, context) => {
    // console.log(caption, files, tags)
    if (!files || !files.length) {
        return new Error('vui lòng chọn hình ảnh')
    }

    let post = await Post.create({ caption, files, tags, user: context.user._id })

    await User.findByIdAndUpdate(context.user._id, {
        $push: { posts: post._id },
        $inc: { postsCount: 1 }
    })

    return post
}

exports.getPost = async (parent, { postId }, context) => {
    const post = await Post.findById(postId)
    if (!post) return new Error('Không tìm thấy bài viết!')

    return post
}

exports.deletePost = async (parent, { postId }, context) => {
    const post = await Post.findById(postId)

    if (!post) return new Error('Không tìm thấy bài đăng!')

    if (post.user === context.user._id)
        return new Error('Bạn không có quyền xóa bài đăng này!')

    await context.user.updateOne({ $pull: { savedPosts: postId }, $inc: { postsCount: -1 } })

    await post.remove()
    const publicIds = post.files.map(files => {
        let publicId = files.split('/').pop()
        publicId = publicId.split('.')[0]
        return publicId
    })
    for (let i = 0; i < publicIds.length; i++) {
        cloudinary.uploader.destroy(publicIds[i], function (result) {
            console.log(result)
        })
    }

    return true
}

exports.toggleLike = async (parent, { postId }, context) => {

    const post = await Post.findById(postId)

    if (!post) return new Error('Không tìm thấy bài đăng!')

    if (post.likes.includes(context.user._id)) {
        await post.updateOne({ $pull: { likes: context.user._id }, $inc: { likesCount: -1 } })
    }
    else {
        await post.updateOne({ $addToSet: { likes: context.user._id }, $inc: { likesCount: 1 } })
    }

    return true
}

exports.searchPosts = async (parent, { searchTerm }, context) => {
    if (!searchTerm) return new Error('vui lòng nhập từ khóa')
    const regex = new RegExp(searchTerm, 'i')

    const posts = await Post.find({ caption: regex }).limit(10)
    return posts
}

exports.toggleSave = async (parent, { postId }, context) => {
    const post = await Post.findById(postId)

    if (!post) return new Error('Không tìm thấy bài đăng!')

    if (context.user.savedPosts.includes(postId)) {
        await context.user.updateOne({
            $pull: {
                savedPosts: postId
            }
        })
    }
    else {
        await context.user.updateOne({
            $addToSet: {
                savedPosts: postId
            }
        })
    }

    return true
}