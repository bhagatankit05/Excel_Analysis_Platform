import express from 'express';
import {
  getActivities,
  addActivity,
  deleteActivities,
} from '../Controllers/Activity.controller.js';
import { auth } from '../middleware/Auth.middleware.js';
import { activitySchema } from '../validations/user.schema.js';
import { validate } from '../middleware/Validate.middleware.js';

const router = express.Router();

// All routes require login
router.get('/', auth, getActivities);
router.post('/', auth,validate(activitySchema), addActivity);
router.delete('/', auth, deleteActivities);

export default router;
