const { gql } = require('apollo-server-express')

module.exports = gql`
    type User {
        _id: ID!
        fullname:String!
        username:String!
        bio:String
        email:String!
        avatar:String!
        followersCount:String
        followingsCount: String
        postsCount:String
        followers:[User]
        followings:[User]
        posts:[Post]
        savedPosts:[Post]
        isMe:Boolean
        isFollowing:Boolean
    }

    type Token {
        token:String!
    }

    extend type Query {
        getProfile(userId:ID!) : User
        me:User
        feed:[Post]
        suggestUsers:[User]
        searchUsers(searchTerm:String!):[User]
    }

    extend type Mutation {
        signin(email:String!,password:String!):Token!
        signup(email:String!,password:String!,fullname:String!,username:String!,):Token!
        follow(userId:ID!):Boolean!
        unfollow(userId:ID!):Boolean!
        editProfile(avatar:String,bio:String,fullname:String,username:String,email:String):User!
    }

`