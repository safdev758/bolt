const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Mother = require('../models/mother');
const Babysitter = require('../models/babysitter');
const Message = require('../models/message');
let ioInstance = null;

// Auth middleware: verifies JWT and attaches userId
function authenticateSocket(socket, next) {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error: Invalid token'));
    }

    socket.user = { id: decoded.userId };
    next();
  });
}

async function addContact(userId, contactUserId) {
  await Promise.all([
    Mother.findByIdAndUpdate(userId, { $addToSet: { contacts: contactUserId } }),
    Babysitter.findByIdAndUpdate(userId, { $addToSet: { contacts: contactUserId } }),
    Mother.findByIdAndUpdate(contactUserId, { $addToSet: { contacts: userId } }),
    Babysitter.findByIdAndUpdate(contactUserId, { $addToSet: { contacts: userId } })
  ]);
}

// Initialize Socket.IO on the HTTP server
function initSocket(server) {
  if (ioInstance) return ioInstance;

  const io = new Server(server, {
    cors: { origin: '*' }
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    socket.join(socket.user.id); // join room named after user's MongoDB ID

    // WebRTC call signaling
    socket.on('call-user', ({ calleeId, offer }) => {
      const targetRoom = mongoose.Types.ObjectId.isValid(calleeId)
        ? calleeId
        : socket.id;
      io.to(targetRoom).emit('incoming-call', { from: socket.user.id, offer });
    });

    socket.on('answer-call', ({ callerId, answer }) => {
      io.to(callerId).emit('call-answered', { from: socket.user.id, answer });
    });

    socket.on('send-ice-candidate', ({ targetId, candidate }) => {
      io.to(targetId).emit('ice-candidate', { from: socket.user.id, candidate });
    });

    // Messaging with persistence
    socket.on('send-message', async ({ to, type, content }) => {
      const allowedTypes = ['text', 'image'];
      if (!allowedTypes.includes(type)) {
        return socket.emit('error', { message: 'Invalid message type' });
      }

      // Determine sender and recipient models
      let senderModel = 'mother';
      let recipientModel = 'mother';
      if (!await Mother.exists({ _id: socket.user.id })) senderModel = 'babysitter';
      if (!await Mother.exists({ _id: to })) recipientModel = 'babysitter';

      // Broadcast to the recipient room
      io.to(to).emit('receive-message', {
        from: socket.user.id,
        type,
        content,
        timestamp: new Date()
      });

      try {
        // Save message to DB
        await Message.create({
          sender: socket.user.id,
          recipient: to,
          senderModel,
          recipientModel,
          type,
          content,
          timestamp: new Date()
        });

        // Update contacts
        await addContact(socket.user.id, to);
      } catch (err) {
        console.error('Error saving message:', err);
        socket.emit('error', { message: 'Message persistence failed' });
      }
    });

    // File transfer
    socket.on('send-file', (data) => {
      const { to, type, content } = data;
      const fileName = `${Date.now()}-${type.split('/')[1]}`;
      const filePath = path.join(__dirname, '..', 'uploads', fileName);

      fs.writeFile(filePath, Buffer.from(content), (err) => {
        if (err) {
          console.error('Error saving file:', err);
          return socket.emit('error', { message: 'File upload failed' });
        }
        io.to(to).emit('receive-file', {
          from: socket.user.id,
          type,
          filePath,
          timestamp: new Date()
        });
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user.id);
    });
  });

  ioInstance = io;
  return io;
}

module.exports = (server) => initSocket(server);
