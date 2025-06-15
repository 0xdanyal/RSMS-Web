import mongoose from 'mongoose';

const staffAllocationSchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  houseNumbers: [{
    type: String,
    required: true,
    trim: true
  }],
  staffIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('StaffAllocation', staffAllocationSchema);