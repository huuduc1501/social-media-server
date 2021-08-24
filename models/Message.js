const mongoose = require('mongoose')
var Schema = mongoose.Schema;
var Message = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['text', 'image', 'video', 'link', 'file'],
    default: 'text',
  },
  message: {
    type: String
  },
  sender: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  conversation: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Conversation'
  }
});

const mongoose = require('mongoose')