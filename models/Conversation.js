const mongoose = require('mongoose')
var Schema = mongoose.Schema;
var Conversation = new Schema({
  type: {
    type: String
  },
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  lastMessage: {
    type: Message
  },
  messages: [{
    type: Message
  }],
  members: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }],
  title: {
    type: String
  }
});