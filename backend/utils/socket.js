// Socket.io configuration for live chat support
const jwt = require('jsonwebtoken');

let io;
const connectedUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // socketId -> userId

const initializeSocket = (server) => {
  const { Server } = require('socket.io');
  
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      // Allow unauthenticated users for now (guest chat)
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
    } catch (err) {
      // Invalid token - allow as guest
      console.log('Invalid socket token, allowing as guest');
    }
    
    next();
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // User registers their socket with their user ID
    socket.on('register', (userId) => {
      connectedUsers.set(userId, socket.id);
      userSockets.set(socket.id, userId);
      socket.userId = userId;
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    // Join a chat room (support room, order room, etc.)
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    // Send message to a room
    socket.on('send_message', (data) => {
      const { room, message, senderId, senderName } = data;
      
      io.to(room).emit('receive_message', {
        id: Date.now(),
        message,
        senderId,
        senderName,
        timestamp: new Date().toISOString()
      });
    });

    // Send message to specific user
    socket.on('send_to_user', (data) => {
      const { userId, message, senderId, senderName } = data;
      const targetSocketId = connectedUsers.get(userId);
      
      if (targetSocketId) {
        io.to(targetSocketId).emit('receive_message', {
          id: Date.now(),
          message,
          senderId,
          senderName,
          timestamp: new Date().toISOString(),
          isDirect: true
        });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { room, userId, userName } = data;
      socket.to(room).emit('user_typing', { userId, userName });
    });

    // Stop typing
    socket.on('stop_typing', (data) => {
      const { room, userId } = data;
      socket.to(room).emit('user_stop_typing', { userId });
    });

    // Admin starts support chat
    socket.on('start_support', (data) => {
      const { userId, adminId, adminName } = data;
      const userSocketId = connectedUsers.get(userId);
      
      const room = `support_${userId}`;
      
      // Join both to the support room
      socket.join(room);
      if (userSocketId) {
        io.to(userSocketId).emit('support_started', {
          room,
          adminId,
          adminName,
          message: `Support agent ${adminName} has joined your chat`
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        userSockets.delete(socket.id);
      }
    });
  });

  return io;
};

// Helper to get IO instance
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Helper to send notification to specific user
const sendToUser = (userId, event, data) => {
  if (io) {
    const socketId = connectedUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  }
};

// Helper to broadcast to all admins
const notifyAdmins = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  sendToUser,
  notifyAdmins
};