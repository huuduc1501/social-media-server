const { gql } = require('apollo-server-express')

module.exports = gql`
    type Conversation {
        _id:ID!
        type:ConversationType!
        owner:User!
        title:String
        members:[User]
        lastMessage:Message
        isReaded:Boolean
    }

    enum ConversationType {
        single 
        group
    }

    type Messages {
        paging: Paging 
        messages:[Message]
    }

    type Members {
        paging:Paging 
        members:[User]
    }

    extend type Query {
        getMessages(conversationId:ID!, cursor:String,limit:Int!):Messages
        getConversationMembers(cursor:String,limit:Int!): Members
    }

    extend type Mutation {
        getSingleConversation(userId:ID!):Conversation
    }
    
`