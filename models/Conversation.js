const mongoose = require('mongoose')
var Schema = mongoose.Schema;
var Conversation = new Schema({
  type: {
    type: String,
    enum: ['group', 'single'],
    require: true,
    default: 'single'
  },
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  members: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }],
  title: {
    type: String
  }
}
  ,
  {
    timestamps: true,
  });

module.exports = mongoose.model('Conversation', Conversation)