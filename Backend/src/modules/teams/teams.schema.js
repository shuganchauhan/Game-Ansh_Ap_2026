const { z } = require('zod');

const createTeamSchema = z.object({
  name: z.string().min(2).max(100),
  game: z.string().min(1).max(100),
  tag: z.string().max(10).optional(),
  division: z.string().max(100).optional(),
  slots_max: z.number().int().min(4).max(10).optional(),
  members: z.array(
    z.object({
      name: z.string().min(1),
      ign: z.string().min(1),
      role: z.string().optional(),
      player_id: z.string().uuid().optional(),
    }),
  ).optional(),
});

const addMemberSchema = z.object({
  name: z.string().min(1),
  ign: z.string().min(1),
  role: z.string().optional(),
  player_id: z.string().uuid().optional().nullable(),
});

const inviteMemberSchema = z.object({
  player_id: z.string().uuid(),
  role: z.string().min(1).max(50).optional(),
  message: z.string().max(500).optional(),
});

const respondInviteSchema = z.object({
  action: z.enum(['accept', 'decline']),
});

module.exports = { createTeamSchema, addMemberSchema, inviteMemberSchema, respondInviteSchema };
