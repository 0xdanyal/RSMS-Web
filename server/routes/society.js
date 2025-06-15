

import express from 'express';
import Society from '../models/Society.js';
import Resident from '../models/Resident.js';
import Staff from '../models/Staff.js';
import User from '../models/User.js';
import { auth, isAdmin } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Create a new society
router.post('/create', async (req, res) => {
  let newManager, newSociety;

  try {
    const { name, address, description, image, managerName, managerEmail, managerPassword, uniqueIdCode, dateOfCreation } = req.body;

    // Validate input
    if (!name || !address || !description || !image || !managerName || !managerEmail || !managerPassword || !uniqueIdCode || !dateOfCreation) {
      throw new Error('All fields are required.');
    }

    // Validate image size
    const imgSize = Buffer.byteLength(image, 'base64') / (1024 * 1024); // Convert to MB
    if (imgSize > 3) { // Changed from 5MB to 3MB
      throw new Error('Image size must not exceed 3MB');
    }

    // Check if the manager email already exists
    const existingUser = await User.findOne({ email: managerEmail });
    if (existingUser) {
      throw new Error('Manager email already exists.');
    }

    // Hash the manager password
    const hashedPassword = await bcrypt.hash(managerPassword, 10);

    // Create the manager user
    newManager = new User({
      name: managerName,
      email: managerEmail,
      password: hashedPassword,
      role: 'manager',
    });

    await newManager.save();

    // Create the society
    newSociety = new Society({
      name,
      address,
      description,
      image,
      managerName,
      managerEmail,
      uniqueIdCode,
      manager: newManager._id,
      dateOfCreation: new Date(dateOfCreation),
    });

    await newSociety.save();

    // Update manager with society reference
    newManager.society = newSociety._id;
    await newManager.save();

    res.status(201).json(newSociety);
  } catch (error) {
    // Manual Rollback Logic
    if (newSociety && newSociety._id) {
      await Society.deleteOne({ _id: newSociety._id }).catch(err => {});
    }

    if (newManager && newManager._id) {
      await User.deleteOne({ _id: newManager._id }).catch(err => {});
    }

    res.status(500).json({ message: error.message });
  }
});

// Get all societies (admin only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const societies = await Society.find().populate('manager', 'email');
    res.json(societies);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific society
router.get('/:id', auth, async (req, res) => {
  try {
    const society = await Society.findById(req.params.id).populate('manager', 'email');
    if (!society) {
      return res.status(404).json({ message: 'Society not found' });
    }
    res.json(society);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get society stats (residents and staff count)
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const societyId = req.params.id;

    // Validate society exists
    const society = await Society.findById(societyId);
    if (!society) {
      return res.status(404).json({ message: 'Society not found' });
    }

    // Count residents (Approved status only)
    const residentCount = await Resident.countDocuments({ 
      society: societyId, 
      status: 'Approved' 
    });

    // Count staff and group by role
    const staffByRole = await Staff.aggregate([
      { $match: { society: societyId } }, // Match staff for this society
      { $group: { _id: '$role', count: { $sum: 1 } } } // Group by role and count
    ]);

    // Format staff data for the pie chart
    const staffData = {
      labels: staffByRole.map(item => item._id), // e.g., ['Cleaner', 'Gardener', ...]
      counts: staffByRole.map(item => item.count) // e.g., [2, 3, ...]
    };

    // Total staff count
    const totalStaff = staffData.counts.reduce((sum, count) => sum + count, 0);

    res.json({
      residentCount,
      totalStaff,
      staffByRole: staffData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Process resident request
router.patch('/:societyId/resident-request/:requestId', auth, async (req, res) => {
  const { societyId, requestId } = req.params;
  const { action } = req.body;

  try {
    // Find the society
    const society = await Society.findById(societyId);
    if (!society) {
      return res.status(404).json({ message: 'Society not found' });
    }

    // Find the resident request in the society's residentRequests array
    const requestIndex = society.residentRequests.findIndex(req => req._id.toString() === requestId);
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Resident request not found' });
    }

    // Get the resident request
    const residentRequest = society.residentRequests[requestIndex];

    if (action === 'approve') {
      // Find the Resident document by email
      const resident = await Resident.findOne({ email: residentRequest.email });
      if (!resident) {
        return res.status(404).json({ message: 'Resident profile not found' });
      }

      // Update statuses
      residentRequest.status = 'Approved';
      resident.status = 'Approved';

      // Remove the request from residentRequests
      society.residentRequests.splice(requestIndex, 1);

      // Save both documents
      await resident.save();
      await society.save();

      res.status(200).json({ message: 'Resident request approved' });
    } else if (action === 'reject') {
      // Find the Resident document by email
      const resident = await Resident.findOne({ email: residentRequest.email });
      if (resident) {
        // Delete the User and Resident documents
        await User.deleteOne({ _id: resident.user, role: 'resident' });
        await Resident.deleteOne({ _id: resident._id });
      }

      // Remove the request from residentRequests
      society.residentRequests.splice(requestIndex, 1);

      // Save the society
      await society.save();

      res.status(200).json({ message: 'Resident request rejected' });
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;