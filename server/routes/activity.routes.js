import express from 'express';
import {
  getActivities,
  addActivity,
  deleteActivities,
} from '../Controllers/Activity.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require login
router.get('/', auth, getActivities);
router.post('/', auth, addActivity);
router.delete('/', auth, deleteActivities);

export default router;
