const { gql } = require('apollo-server-express')

const userSchema = require('./user')
const commentSchema = require('./comment')
const postSchema = require('./post')

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
`

// module.exports = [linkSchema, userSchema, postSchema, commentSchema]