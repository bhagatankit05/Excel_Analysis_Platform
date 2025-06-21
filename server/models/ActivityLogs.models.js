import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['ai_insight', 'login', 'logout', 'update', 'delete'], // Add more as needed
  },
  description: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: false,
  },
  userId: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Activity', activitySchema);
