// routes/auth.routes.js
import express from 'express';
import { validate } from '../middleware/Validate.middleware.js';
import { auth } from '../middleware/auth.middleware.js';
import { loginUser, getProfile, verifyToken } from '../controllers/auth.controller.js';
import { loginSchema } from '../schemas/user.schema.js';

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/profile', auth, getProfile);
router.get('/verify', auth, verifyToken);

export default router;
