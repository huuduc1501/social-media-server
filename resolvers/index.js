const userResolver = require('./user')
const postResolver = require('./post')
const commentResolver = require('./comment')
const conversationResolver = require('./conversation')
const messageResolver = require('./message')

module.exports = [
    userResolver,
    postResolver,
    commentResolver,
    conversationResolver,
    messageResolver
]