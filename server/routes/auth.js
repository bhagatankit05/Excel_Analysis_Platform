import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),

    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),

    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),

    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

    body('role')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage('Role must be either user or admin'),
  ],
  async (req, res) => {
    try {
      // Validation Result
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { username, email, password, role = 'user' } = req.body;

      // Check for existing user
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username or email already exists',
        });
      }

      // Save new user
      const newUser = new User({ username, email, password, role });
      await newUser.save();

      // Create token
      const token = jwt.sign(
        { userId: newUser._id, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt,
        },
      });
    } catch (error) {
      console.error('Registration error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Login endpoint
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { username, password } = req.body;

      // Find user
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password',
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password',
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          lastLogin: user.lastLogin,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Verify token endpoint
router.get('/verify', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: {
      id: req.user.userId,
      username: req.user.username,
    },
  });
});

export default router;
