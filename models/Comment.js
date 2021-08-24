const mongoose = require('mongoose')
var Schema = mongoose.Schema;
var Comment = new Schema({
  text: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  post: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Post'
  }
},
  {
    timestamps: true,
  });

module.exports = mongoose.model('Comment', Comment)