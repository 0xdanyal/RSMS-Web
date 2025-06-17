import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

const router = express.Router();

export default (io) => {
  // Search users by phoneNumber within the same society
  router.get('/search', async (req, res) => {
    try {
      const { query, societyId, userType } = req.query;
      if (!societyId || !query) {
        return res.status(400).json({ error: 'Society ID and query are required' });
      }

      const searchConditions = {
        society: societyId,
        phoneNumber: { $regex: query, $options: 'i' },
      };

      if (userType === 'resident') {
        searchConditions.role = 'resident';
        searchConditions.isEmailVerified = true;
      } else if (userType === 'staff') {
        searchConditions.role = 'staff';
      } else {
        return res.status(400).json({ error: 'Invalid userType' });
      }

      const users = await User.find(searchConditions).select('name phoneNumber _id role');
      res.json(users);
    } catch (error) {
      console.error('Search error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Get user's chats
  router.get('/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const chats = await Chat.find({ participants: userId })
        .populate('participants', 'name role')
        .select('participants isGroup groupName createdAt lastMessage');
      res.json(chats);
    } catch (error) {
      console.error('Fetch chats error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Get messages for a chat
  router.get('/messages/:chatId', async (req, res) => {
    try {
      const { chatId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ error: 'Invalid chat ID' });
      }

      const messages = await Message.find({ chatId })
        .populate('sender', 'name role')
        .select('sender content timestamp status _id');
      res.json(messages);
    } catch (error) {
      console.error('Fetch messages error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Create a new chat
  router.post('/', async (req, res) => {
    try {
      const { participants, isGroup } = req.body;
      if (!participants || participants.length < 2) {
        return res.status(400).json({ error: 'At least two participants are required' });
      }

      const chat = new Chat({
        participants,
        isGroup: isGroup || false,
        createdAt: new Date(),
      });
      await chat.save();

      // Notify participants
      participants.forEach(p => {
        io.to(p.toString()).emit('newChat', { chatId: chat._id });
      });

      res.json(chat);
    } catch (error) {
      console.error('Create chat error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};