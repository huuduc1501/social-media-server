const mongoose = require('mongoose')
var Schema = mongoose.Schema;
var Notification = new Schema({
  notifications: [{
    type: {
      type: String,
      required: true,
      enum: ['newLike', 'newComment', 'newFollower'],
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    },
    text: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    readed: {
      type: Boolean,
      required: true
    }
  }],
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}
  ,
  {
    timestamps: true,
  });