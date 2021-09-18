const { gql } = require('apollo-server-express')

module.exports = gql`
    type Message {
        _id:ID!
        type:MessageType 
        message:String 
        sender:User!
        images:[String]
        files:[File] 
        conversation:Conversation
        createAt:String
        isMine:Boolean!
        createdAt:String!
    }

    type File {
        name:String   
        path:String 
    }

    enum MessageType {
        text 
        image 
        file 
        notification
    }
`