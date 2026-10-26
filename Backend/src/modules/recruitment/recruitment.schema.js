const { z } = require('zod');

const createPostingSchema = z.object({
  role: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
});

const updateApplicationSchema = z.object({
  status: z.enum(['shortlisted', 'accepted', 'rejected']),

});

const applyToPostingSchema = z.object({
  pitch: z.string().max(2000).optional().default(''),
  vod_link: z.string().url().max(500).optional().or(z.literal('')),
});

module.exports = { createPostingSchema, updateApplicationSchema, applyToPostingSchema };
