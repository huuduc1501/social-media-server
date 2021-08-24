const userResolver = require('./user')
const postResolver = require('./post')
const commentResolver = require('./comment')

module.exports = [userResolver, postResolver,commentResolver]