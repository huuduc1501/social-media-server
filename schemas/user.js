const { gql } = require('apollo-server-express')

module.exports = gql`
    type User {
        _id: ID!
        fullname:String!
        username:String!
        bio:String
        email:String!
        avatar:String!
        followersCount:Int
        followingsCount: Int
        postsCount:Int
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

    type Feed {
        paging:Paging
        posts:[Post]
    }
    type Paging {
        hasMore:Boolean
        nextCursor:String
    }

    type Conversations {
        paging:Paging
        conversations:[Conversation]
    }

    extend type Query {
        getProfile(userId:ID!) : User
        me:User
        feed(cursor:String,limit:Int!):Feed
        suggestUsers:[User]
        searchUsers(searchTerm:String!):[User]
        getConversations(cursor:String,limit:Int!):Conversations

    }

    extend type Mutation {
        signin(email:String!,password:String!):Token!
        signup(email:String!,password:String!,fullname:String!,username:String!,):Token!
        follow(userId:ID!):Boolean!
        unfollow(userId:ID!):Boolean!
        editProfile(avatar:String,bio:String,fullname:String,username:String,email:String):User!
        validateEmail(email:String!):Boolean!
        validateUsername(username:String!):Boolean!
    }

`