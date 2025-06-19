import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  details: {
    type: String,
  },
  userId: {
    type: String,
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('Activity', activitySchema);
