

import express from 'express';
import StaffAllocation from '../models/staffAllocationModel.js';
import {auth} from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Create a new staff allocation
router.post('/', auth, async (req, res) => {
  try {
    const { address, houseNumbers, staffIds } = req.body;
    const societyId = req.params.societyId;

    const allocation = new StaffAllocation({
      society: societyId,
      address,
      houseNumbers,
      staffIds
    });

    const savedAllocation = await allocation.save();
    res.status(201).json(savedAllocation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all staff allocations for a society
router.get('/', auth, async (req, res) => {
  try {
    const allocations = await StaffAllocation.find({ society: req.params.societyId });
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a staff allocation by ID
router.delete('/:allocationId', auth, async (req, res) => {
  try {
    const { societyId, allocationId } = req.params;
    const allocation = await StaffAllocation.findOneAndDelete({
      _id: allocationId,
      society: societyId
    });

    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    res.json({ message: 'Allocation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;