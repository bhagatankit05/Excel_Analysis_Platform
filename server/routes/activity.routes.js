import express from 'express';
import { getActivities, addActivity, deleteActivities } from '../controllers/activity.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require login
router.get('/', requireAuth, getActivities);
router.post('/', requireAuth, addActivity);
router.delete('/', requireAuth, deleteActivities);

export default router;