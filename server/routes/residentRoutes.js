// import express from 'express';
// import jwt from 'jsonwebtoken';
// import Resident from '../models/Resident.js';

// const router = express.Router();

// // Middleware to verify JWT token
// const authMiddleware = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'Authentication required' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     console.log('Set req.user with ID:', decoded.userId);
//     next();
//   } catch (error) {
//     console.error('Token verification error:', error);
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };

// // Get all residents, optionally filtered by society
// router.get('/', authMiddleware, async (req, res) => {
//   try {
//     const query = req.query.society ? { society: req.query.society } : {};
//     console.log('Fetching residents with query:', query);
//     const residents = await Resident.find(query).populate('user', 'name email address');
//     if (!residents.length) {
//       console.log('No residents found for query:', query);
//       return res.status(404).json({ message: 'No residents found' });
//     }
//     console.log('Fetched residents:', residents);
//     res.json(residents);
//   } catch (error) {
//     console.error('Error fetching residents:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get a resident by user ID
// router.get('/user/:userId', authMiddleware, async (req, res) => {
//   try {
//     console.log('Fetching resident for user ID:', req.params.userId);
//     const resident = await Resident.findOne({ user: req.params.userId }).populate('user', 'name email address');
//     if (!resident) {
//       console.log('No resident found for user ID:', req.params.userId);
//       return res.status(404).json({ message: 'Resident not found' });
//     }
//     console.log('Fetched resident:', resident);
//     res.json(resident);
//   } catch (error) {
//     console.error('Error fetching resident by user ID:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// export default router;

import express from 'express';
import Resident from '../models/Resident.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js'; // 

const router = express.Router();


// router.get('/', auth, async (req, res) => {
//   try {
//     const query = req.query.society ? { society: req.query.society } : {};
//     console.log('Fetching residents with query:', query);
//     const residents = await Resident.find(query).populate('user', 'name email address');
//     if (!residents.length) {
//       console.log('No residents found for query:', query);
//       return res.status(404).json({ message: 'No residents found' });
//     }
//     console.log('Fetched residents:', residents);
//     res.json(residents);
//   } catch (error) {
//     console.error('Error fetching residents:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// Get all residents, optionally filtered by society
router.get('/', auth, async (req, res) => {
   try {
    const query = req.query.society ? { society: req.query.society } : {};
    console.log('Fetching residents with query:', query);

    const residents = await User.find(query).populate('user', 'name email address houseNumber');
    console.log('DB Response:', JSON.stringify(residents, null, 2));

    if (!residents.length) {
      return res.status(404).json({ message: 'No residents found' });
    }

    const cleaned = residents.map(r => ({
      _id: r._id,
      userId: r.user?._id,
      name: r.user?.name,
      email: r.user?.email,
      address: r.user?.address || 'N/A',
      houseNumber: r.user?.houseNumber || r.houseNumber || 'N/A',
      society: r.society,
      status: r.status,
      createdAt: r.createdAt,
    }));

    return res.json(cleaned);
  } catch (err) {
    console.error('Error fetching residents [residents route]:', err);
    return res.status(500).json({
      message: 'Server error fetching residents',
      error: err.message // exposes the error
    });
  }
});


router.get('/user/:userId', auth, async (req, res) => {
  try {
    console.log('Fetching resident for user ID:', req.params.userId);
    const resident = await Resident.findOne({ user: req.params.userId }).populate('user', 'name email address');
    if (!resident) {
      console.log('No resident found for user ID:', req.params.userId);
      return res.status(404).json({ message: 'Resident not found' });
    }
    console.log('Fetched resident:', resident);
    res.json(resident);
  } catch (error) {
    console.error('Error fetching resident by user ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
