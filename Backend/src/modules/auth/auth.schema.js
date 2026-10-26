const { z } = require('zod');

const simpleSignupSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  username: z.string().optional(),
});

const playerSignupSchema = z.object({
  username: z.string().min(2).max(50).optional(),
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  game_ign: z.string().max(100).optional(),
});

const orgSignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(12, 'Password must be at least 12 characters'),
});

const organizerSignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(12, 'Password must be at least 12 characters'),
});

const loginSchema = z.object({
  email: z.string().min(1, 'Email or username is required').transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['player', 'org', 'organizer', 'admin']).optional(),
});

module.exports = {
  simpleSignupSchema,
  playerSignupSchema,
  orgSignupSchema,
  organizerSignupSchema,
  loginSchema,
};
