const { gql } = require('apollo-server-express')

module.exports = gql`
    type Message {
        _id:ID!
        type:MessageType 
        message:String 
        sender:User!
        images:[String]
        file:File 
        conversation:Conversation
        createAt:String
        isMine:Boolean!
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