

import express from 'express';
import Listing from '../models/ListingModel.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all listings across all societies
router.get('/all', async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate('society', 'name');
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get listings for a specific society (ManagerDashboard)
router.get('/:societyId', auth, async (req, res) => {
  try {
    const { societyId } = req.params;
    console.log(`GET /listings for societyId: ${societyId}`);
    const listings = await Listing.find({ society: societyId })
      .populate('society', 'name');
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new listing (ManagerDashboard)
router.post('/', auth, async (req, res) => {
  try {
    const {
      societyId,
      title,
      description,
      type,
      price,
      location,
      bedrooms,
      bathrooms,
      area,
      images,
      ownerName,
      contact
    } = req.body;

    if (!societyId) {
      return res.status(400).json({ message: 'Society ID is required' });
    }

    if (!images || images.length < 3 || images.length > 5) {
      return res.status(400).json({ message: 'At least 3 and up to 5 images are required' });
    }

    console.log(`POST /listings for societyId: ${societyId}`, req.body);
    const listing = new Listing({
      title,
      description,
      type,
      price,
      location,
      bedrooms,
      bathrooms,
      area,
      images,
      society: societyId,
      ownerName,
      contact
    });

    await listing.save();
    res.status(201).json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update listing type (sale/rent) (ManagerDashboard)
router.patch('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, societyId } = req.body;

    if (!['sale', 'rent'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type' });
    }

    const listing = await Listing.findOneAndUpdate(
      { _id: id, society: societyId },
      { type },
      { new: true }
    );

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete listing (ManagerDashboard)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { societyId } = req.query;
    console.log(`DELETE /listings/${id} for societyId: ${societyId}`);
    const listing = await Listing.findOneAndDelete({ _id: id, society: societyId });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get listing by ID
router.get('/single/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`GET /listings/${id}`);
    const listing = await Listing.findById(id)
      .populate('society', 'name');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;