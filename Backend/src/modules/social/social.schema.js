const { z } = require('zod');

const followSchema = z.object({
  target_type: z.enum(['org', 'team', 'organizer']),
  target_id: z.string().uuid(),
});

const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
  category: z.string().optional(),
  game: z.string().optional(),
});

module.exports = { followSchema, createPostSchema };
