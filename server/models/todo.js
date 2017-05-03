var mongoose = require('mongoose');

var Todo = mongoose.model('Todo', {
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  }
});

module.exports = {Todo};
