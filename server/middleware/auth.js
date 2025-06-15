
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No token provided');
    }
    console.log('Token:', token.substring(0, 10) + '...'); // Partial token for safety
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded); // Log payload
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }
    req.user = user;
    console.log('Set req.user with ID:', user._id.toString()); // Confirm user ID
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Authentication required' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export const isManager = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Manager access required' });
  }
  next();
};