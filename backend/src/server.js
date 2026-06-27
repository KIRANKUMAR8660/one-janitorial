import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import logger from './config/logger.js';
import { initWorkflowQueue } from './services/workflowQueue.js';
import Message from './models/Message.js';
import User from './models/User.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize Workflow Queue
initWorkflowQueue();

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
global.io = io;

// Presence cache
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // User joins with credentials
  socket.on('join_user', async (userId) => {
    if (!userId) return;
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    logger.info(`User ${userId} joined room. Presence status set to online.`);

    // Broadcast presence update
    io.emit('presence_update', { userId, status: 'Online' });
  });

  // Join a channel/room
  socket.on('join_channel', (channelId) => {
    socket.join(channelId);
    logger.info(`Socket ${socket.id} joined channel: ${channelId}`);
  });

  // Join execution log stream
  socket.on('join_execution', (executionId) => {
    socket.join(executionId);
    logger.info(`Socket ${socket.id} joined execution room: ${executionId}`);
  });

  // Send a message
  socket.on('send_message', async (messageData) => {
    const { channel, senderId, content, threadParent, mentions } = messageData;
    try {
      const msg = new Message({
        channel,
        sender: senderId,
        content,
        threadParent,
        mentions
      });
      await msg.save();
      const populatedMsg = await msg.populate('sender', 'email');

      // Broadcast to room
      io.to(channel).emit('new_message', populatedMsg);

      // Handle mentions
      if (mentions && mentions.length > 0) {
        mentions.forEach(uid => {
          io.to(uid).emit('mention_received', {
            message: `You were mentioned in a message: "${content.substring(0, 30)}..."`,
            channelId: channel
          });
        });
      }
    } catch (err) {
      logger.error(`Socket message error: ${err.message}`);
    }
  });

  // Read receipt logging
  socket.on('read_message', async ({ messageId, userId }) => {
    try {
      const msg = await Message.findById(messageId);
      if (msg) {
        // Verify not already read
        if (!msg.readBy.some(r => r.user.toString() === userId)) {
          msg.readBy.push({ user: userId, readAt: new Date() });
          await msg.save();
          io.to(msg.channel.toString()).emit('message_read', { messageId, userId });
        }
      }
    } catch (err) {
      logger.error(`Read receipt write failure: ${err.message}`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(uid);
        io.emit('presence_update', { userId: uid, status: 'Offline' });
        logger.info(`User ${uid} status updated to offline`);
        break;
      }
    }
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Stop the existing process or set PORT to a different value.`);
  } else {
    logger.error(`Server error: ${err.message}`);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => process.exit(0));
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export { io };
