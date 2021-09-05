const { gql } = require('apollo-server-express')

const userSchema = require('./user')
const commentSchema = require('./comment')
const postSchema = require('./post')
const conversationSchema = require('./conversation')
const messageSchema = require('./message')

module.exports = gql`
    type Query {
        _: Boolean
    }
    type Mutation {
        _: Boolean
    }
    type Subscription {
        _: Boolean
    }
    ${userSchema}
    ${postSchema}
    ${commentSchema}
    ${conversationSchema}
    ${messageSchema}
`

// module.exports = [linkSchema, userSchema, postSchema, commentSchema]