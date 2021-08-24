const Post = require('../models/Post')
const User = require('../models/User')


exports.suggestPosts = async (parent, args, context) => {
    const posts = await Post.find().limit(100)
    return posts
}

exports.createPost = async (parent, { caption, files, tags }, context) => {
    console.log(caption, files, tags)
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

    const posts = await Post.find({ caption: regex })
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