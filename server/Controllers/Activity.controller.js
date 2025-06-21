import Activity from '../models/ActivityLogs.models.js';

import { z } from 'zod';
const querySchema = z.object({
  userId: z.string().min(1, 'userId is required'),
});

export const getActivities = async (req, res) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.format(),
      });
    }
    const { userId } = req.query;

    //Validate presence of userId
    if (!userId || typeof userId !== 'string') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: userId is required and must be a string',
      });
    }

    // Fetch only that user's activities, sorted by latest first
    const activities = await Activity.find({ userId }).sort({ timestamp: -1 });

    // Send structured response
    res.status(200).json({
      success: true,
      data: activities,
      total: activities.length,
    });
  } catch (error) {
    console.error('Get Activities Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
    });
  }
};

// POST: Add a new activity (with custom 'id' generation)
export const addActivity = async (req, res) => {
  try {
    const { type, description, details, userId, timestamp, id } = req.body;

    const activity = new Activity({
      id,
      type,
      description,
      details,
      userId,
      timestamp: timestamp || new Date().toISOString(), // fallback to current time
    });

    await activity.save();
    res.status(201).json({ message: 'Activity logged' });
  } catch (error) {
    console.error('Add Activity Error:', error);
    res.status(500).json({ message: 'Failed to log activity' });
  }
};

// DELETE: Delete all or user-specific activities
export const deleteActivities = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    await Activity.deleteMany(filter);
    res.status(200).json({ message: 'Activities cleared' });
  } catch (error) {
    console.error('Delete Activities Error:', error);
    res.status(500).json({ message: 'Failed to delete activities' });
  }
};
