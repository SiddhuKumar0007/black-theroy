const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  senderRole: {
    type: String,
    enum: ['customer', 'admin'],
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  messages: [chatMessageSchema],
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  lastMessage: {
    type: String,
    default: ''
  },
  unreadByAdmin: {
    type: Boolean,
    default: true
  },
  unreadByCustomer: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);
