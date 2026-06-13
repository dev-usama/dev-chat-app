const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: String,
    senderName: String,
    text: String,
    time: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);