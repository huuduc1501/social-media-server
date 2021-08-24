const mongoose = require('mongoose')
var Schema = mongoose.Schema;
var Post = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  caption: {
    type: String
  },
  files: [{
    type: String
  }],
  likes: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    required: true,
    default: 0,
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  tags: [{
    type: String
  }],
  commentsCount: {
    type: Number,
    required: true,
    default: 0,
  },
  comments: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Comment'
  }]
},
  { timestamps: true });

module.exports = mongoose.model('Post', Post)