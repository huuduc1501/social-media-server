const { gql } = require('apollo-server-express')

module.exports = gql`   
    type Comment {
        _id: ID!
        text:String!
        post:Post
        user:User
        isMine:Boolean
    }
    extend type Mutation {
        addComment(postId:ID!,text:String!):Comment
        deleteComment(commentId:ID!):Boolean!
        # modifyComment(commentID:ID!):Comment
    }
`
