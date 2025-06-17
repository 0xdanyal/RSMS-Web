


import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import societyRoutes from './routes/society.js';
import residentRoutes from './routes/residentRoutes.js';
import staffRoutes from './routes/staff.js';
import issueRoutes from './routes/issueRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import housingRoutes from './routes/housingRoutes.js';
import staffAllocationRoutes from './routes/staffAllocationRoutes.js';
import listingRoutes from './routes/listingsRoutes.js';
import chatRoutes from './routes/chat.js';
import Chat from './models/Chat.js';
import Message from './models/Message.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json({ limit: '3mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.IO events
io.on('connection', (socket) => {
  console.log('Socket.IO client connected:', socket.id);

  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    } else {
      console.error('Join error: No userId provided');
    }
  });

  socket.on('sendMessage', async ({ chatId, senderId, content }, callback) => {
    try {
      // Validate inputs
      if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
        const error = new Error('Invalid or missing chatId');
        if (typeof callback === 'function') {
          callback({ error: error.message });
        }
        return;
      }
      if (!senderId || !content) {
        const error = new Error('Missing senderId or content');
        if (typeof callback === 'function') {
          callback({ error: error.message });
        }
        return;
      }

      // Validate chat and sender
      const chat = await Chat.findById(chatId);
      if (!chat) {
        const error = new Error('Chat not found');
        if (typeof callback === 'function') {
          callback({ error: error.message });
        }
        return;
      }

      // Check if sender is a participant (or admin for group chats)
      const isParticipant = chat.participants.some(p => p.toString() === senderId);
      const isGroupAdmin = chat.isGroup && chat.groupAdmin?.toString() === senderId;
      if (!isParticipant && !isGroupAdmin) {
        const error = new Error('User not authorized for this chat');
        if (typeof callback === 'function') {
          callback({ error: error.message });
        }
        return;
      }

      // Create and save message
      const message = new Message({
        chatId: chatId, // Use 'chatId' to match schema
        sender: senderId,
        content,
        timestamp: new Date(),
        status: 'sent',
      });
      await message.save();

      // Update chat's last message
      chat.lastMessage = { content, timestamp: message.timestamp };
      await chat.save();

      // Populate sender details
      const populatedMessage = await Message.findById(message._id).populate('sender', 'name');

      // Emit new message to chat room and participants
      io.to(chatId).emit('newMessage', {
        chatId,
        senderId,
        content,
        timestamp: message.timestamp,
        status: message.status,
        messageId: message._id,
      });

      chat.participants.forEach(participant => {
        if (participant.toString() !== senderId) {
          io.to(participant.toString()).emit('newMessage', {
            chatId,
            senderId,
            content,
            timestamp: message.timestamp,
            status: message.status,
            messageId: message._id,
          });
        }
      });

      // Simulate delivery after 1 second
      setTimeout(async () => {
        message.status = 'delivered';
        await message.save();
        io.to(chatId).emit('messageDelivered', { chatId, messageId: message._id });
        chat.participants.forEach(participant => {
          if (participant.toString() !== senderId) {
            io.to(participant.toString()).emit('messageDelivered', { chatId, messageId: message._id });
          }
        });
      }, 1000);

      // Send success response if callback exists
      if (typeof callback === 'function') {
        callback({ success: true, messageId: message._id });
      }
    } catch (err) {
      console.error('Send message error:', err.message);
      if (typeof callback === 'function') {
        callback({ error: err.message });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO client disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/societies', societyRoutes);
app.use('/api/societies/staffcreation', staffRoutes);
app.use('/api/societies/residents', residentRoutes);
app.use('/api', issueRoutes);
app.use('/api', announcementRoutes);
app.use('/api/societies/:societyId/housing', housingRoutes);
app.use('/api/societies/:societyId/allocations', staffAllocationRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/societies/:societyId/listings', listingRoutes);
app.use('/api/chat', chatRoutes(io));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));