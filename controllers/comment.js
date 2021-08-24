const Comment = require('../models/Comment')
const Post = require('../models/Post')

exports.addComment = async (parent, { postId, text }, context) => {
    const post = await Post.findById(postId)

    if (!post) return new Error('Không tìm thấy bài đăng!')

    const comment = await Comment.create({
        text,
        post: postId,
        user: context.user._id
    })

    await post.updateOne({
        $addToSet: {
            comments: comment._id
        },
        $inc: {
            commentsCount: 1
        }
    })
    console.log(comment)

    return comment
}

exports.deleteComment = async (parent, { commentId }, context) => {
    const comment = await Comment.findById(commentId)

    if (!comment) return new Error('Không tìm thấy bình luận!')

    const post = await Post.findById(comment.post)

    if (!post) return new Error('Không tìm thấy bài đăng!')

    if (context.user._id.toString() !== comment.user.toString())
        return new Error('Bạn không có quyền xóa bình luận này!')

    await post.updateOne({
        $pull: {
            comments: commentId
        },
        $inc: {
            commentsCount: -1
        }
    })

    await comment.remove()

    return true

}