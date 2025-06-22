import { z } from 'zod';

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores'
      ),

    email: z.string().email('Please provide a valid email'),

    password: z.string().min(6, 'Password must be at least 6 characters long'),

    confirmPassword: z.string(),

    role: z.enum(['user', 'admin']).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});


export const activitySchema = z.object({
  id: z.number(),
  type: z.string(),
  description: z.string().min(1, 'Description is required'),
  details: z.string().optional(),
  userId: z.string().min(1, 'User ID is required'),
  timestamp: z.string().datetime(),
});