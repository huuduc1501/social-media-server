const { gql } = require('apollo-server-express')

module.exports = gql`
    type Post {
        _id: ID!
        caption:String
        files:[String]
        likesCount:Int
        user:User
        tags:[String]
        commentsCount:Int
        likes:[User]
        comments:[Comment]
        isMine:Boolean!
        isLiked:Boolean!
        isSaved:Boolean!
    }



    extend type Query {
        getPost(postId:ID!):Post
        suggestPosts(cursor:String,limit:Int!):Feed
        searchPosts(searchTerm:String!):[Post]
    }

    extend type Mutation {
        createPost(caption:String,files:[String!],tags:[String]):Post
        modifyPost(postId:ID!,caption:String,files:[String],tags:[String]):Post
        deletePost(postId:ID!):Boolean!
        toggleLike(postId:ID!):Boolean!
        toggleSave(postId:ID!):Boolean!
    }
`