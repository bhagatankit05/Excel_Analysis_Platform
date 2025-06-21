// routes/auth.routes.js
import express from 'express';
import { validate } from '../middleware/Validate.middleware.js';
import { auth } from '../middleware/Auth.middleware.js';
import {
  loginUser,
  getProfile,
  verifyToken,
  registerUser,
} from '../Controllers/Auth.controller.js';
import { loginSchema, registerSchema } from '../validations/user.schema.js';

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/profile', auth, getProfile);
router.get('/verify', auth, verifyToken);

export default router;
