const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['mother', 'babysitter']
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['mother', 'babysitter']
  },
  type: {
    type: String,
    enum: ['text', 'image'],
    default: 'text'
  },
  content: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('message', messageSchema);
