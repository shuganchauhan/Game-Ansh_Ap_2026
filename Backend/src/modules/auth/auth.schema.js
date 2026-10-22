const { z } = require('zod');

const simpleSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().optional(),
});

const playerSignupSchema = z.object({
  username: z.string().min(2).max(50).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  game_ign: z.string().max(100).optional(),
});

const orgSignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
});

const organizerSignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['player', 'org', 'organizer', 'admin']).optional(),
});

module.exports = {
  simpleSignupSchema,
  playerSignupSchema,
  orgSignupSchema,
  organizerSignupSchema,
  loginSchema,
};
