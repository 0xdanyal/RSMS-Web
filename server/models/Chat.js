import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  isGroup: { type: Boolean, default: false },
  // Group-specific fields
  groupName: { type: String },
  groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  groupDescription: { type: String },
  groupCreatedAt: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Chat', chatSchema);