const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Mother = require('../models/mother');
const Babysitter = require('../models/babysitter');

let ioInstance = null;

// Auth middleware: verifies JWT and attaches userId
function authenticateSocket(socket, next) {
  const token = socket.handshake.auth.token;
  console.log('🛂 Token received:', token);

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log('❌ JWT Verification failed:', err.message);
      return next(new Error('Authentication error: Invalid token'));
    }

    console.log('✅ JWT decoded:', decoded);
    socket.user = { id: decoded.userId };
    next();
  });
}

// Add mutual contacts between two user IDs
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
    console.log('User connected:', socket.user);
    socket.join(socket.user.id); // join room named after user's MongoDB ID

    // WebRTC call signaling
    socket.on('call-user', ({ calleeId, offer }) => {
      const targetRoom = mongoose.Types.ObjectId.isValid(calleeId)
        ? calleeId
        : socket.id;
      io.to(targetRoom).emit('incoming-call', { from: socket.user.id, offer });
    });

    socket.on('answer-call', ({ callerId, answer }) => {
      const targetRoom = mongoose.Types.ObjectId.isValid(callerId)
        ? callerId
        : callerId;
      io.to(targetRoom).emit('call-answered', { from: socket.user.id, answer });
    });

    socket.on('send-ice-candidate', ({ targetId, candidate }) => {
      const targetRoom = mongoose.Types.ObjectId.isValid(targetId)
        ? targetId
        : targetId;
      io.to(targetRoom).emit('ice-candidate', { from: socket.user.id, candidate });
    });

    // Messaging
    socket.on('send-message', async ({ to, type, content }) => {
      const allowedTypes = ['text', 'image'];
      if (!allowedTypes.includes(type)) {
        return socket.emit('error', { message: 'Invalid message type' });
      }

      // Broadcast to the appropriate room
      io.to(to).emit('receive-message', {
        from: socket.user.id,
        type,
        content,
        timestamp: new Date()
      });

      // Determine the actual userId for contact updates
      let contactUserId = null;
      if (mongoose.Types.ObjectId.isValid(to)) {
        contactUserId = to;
      } else if (io.sockets.sockets.has(to)) {
        contactUserId = io.sockets.sockets.get(to).user.id;
      } else {
        console.warn(`Skipping contact update for invalid ID: ${to}`);
        return;
      }

      // Update contacts in MongoDB
      try {
        await addContact(socket.user.id, contactUserId);
      } catch (err) {
        console.error('Error adding to contacts:', err);
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
