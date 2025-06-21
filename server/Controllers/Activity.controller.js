import Activity from '../models/ActivityLogs.models.js';

// GET: All or user-specific activities
export const getActivities = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const activities = await Activity.find(filter).sort({ timestamp: -1 });
    res.status(200).json(activities);
  } catch (error) {
    console.error('Get Activities Error:', error);
    res.status(500).json({ message: 'Failed to fetch activities' });
  }
};

// POST: Add a new activity (with custom 'id' generation)
export const addActivity = async (req, res) => {
  try {
    const { type, description, details, userId, timestamp ,id } = req.body;

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
