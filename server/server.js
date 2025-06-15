

// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import authRoutes from './routes/auth.js';
// import societyRoutes from './routes/society.js';
// import residentRoutes from './routes/society.js';
// import staffRoutes from './routes/staff.js';
// import issueRoutes from './routes/issueRoutes.js'; // Add issue routes import
// import announcementRoutes from './routes/announcementRoutes.js';

// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json({ limit: '3mb' })); // Increase payload limit to 3MB

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI)
//   .then(async () => {
//     console.log('Connected to MongoDB');
//     // Create admin user after successful connection
//     // await createAdminUser();
//   })
//   .catch(err => console.error('MongoDB connection error:', err));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/societies/create', societyRoutes);
// app.use('/api/societies/staffcreation', staffRoutes);
// app.use('/api/societies', residentRoutes);
// app.use('/api', issueRoutes); // Mount issue-related routes
// app.use('/api', announcementRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import societyRoutes from './routes/society.js';
import residentRoutes from './routes/residentRoutes.js'; // Correct import path
import staffRoutes from './routes/staff.js';
import issueRoutes from './routes/issueRoutes.js'; // Add issue routes import
import announcementRoutes from './routes/announcementRoutes.js';
import housingRoutes from './routes/housingRoutes.js'; // Add housing routes import
import staffAllocationRoutes from './routes/staffAllocationRoutes.js';
import listingRoutes from './routes/listingsRoutes.js'; // Add listings routes import


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '3mb' })); // Increase payload limit to 3MB

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Create admin user after successful connection
    // await createAdminUser();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/societies', societyRoutes);
app.use('/api/societies/staffcreation', staffRoutes);
app.use('/api/societies/residents', residentRoutes); // Mount resident routes at /api/societies/residents
app.use('/api', issueRoutes); // Mount issue-related routes
app.use('/api', announcementRoutes);
app.use('/api/societies/:societyId/housing', housingRoutes); // Mount housing routes
app.use('/api/societies/:societyId/allocations', staffAllocationRoutes);
app.use('/api/listings', listingRoutes); // Global listing routes (e.g., /all)
app.use('/api/societies/:societyId/listings', listingRoutes); // Society-specific listing routes




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));