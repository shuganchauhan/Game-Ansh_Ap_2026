const { z } = require('zod');

const updatePlayerSchema = z.object({
  username: z.string().min(2).max(50).optional(),
  game_ign: z.string().max(100).optional(),
  tagline: z.string().max(255).optional(),
  bio: z.string().optional(),
  avatar_url: z.string().optional(),
  banner_url: z.string().optional(),
  location: z.string().max(100).optional(),
  primary_game: z.string().max(50).optional(),
  discord: z.string().max(100).optional(),
  lft_status: z.string().max(100).optional(),
  scrim_availability: z.string().max(100).optional(),
  game_accounts: z.record(z.any()).optional(),
  stats: z.record(z.any()).optional(),
  career_milestones: z.array(z.any()).optional(),
});

module.exports = { updatePlayerSchema };
