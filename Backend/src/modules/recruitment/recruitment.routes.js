const { Router } = require('express');
const { createPosting, getTeamPostings, applyToPosting, updateApplicationStatus, getApplication, closePosting, listApplications } = require('./recruitment.controller');
const { authenticate, authorize } = require('../../shared/auth/middleware');
const { validate } = require('../../shared/validation');
const { createPostingSchema, updateApplicationSchema, applyToPostingSchema } = require('./recruitment.schema');
const { strictLimiter } = require('../../shared/ratelimit');

const router = Router();

router.post('/teams/:teamId/postings', authenticate, authorize(['org', 'player', 'admin']), strictLimiter, validate(createPostingSchema), createPosting);
router.get('/teams/:teamId/postings', getTeamPostings);
router.patch('/postings/:postingId/close', authenticate, authorize(['org', 'player', 'admin']), closePosting);
router.post('/postings/:postingId/apply', authenticate, authorize('player'), validate(applyToPostingSchema), applyToPosting);
router.get('/applications', authenticate, authorize(['player', 'org', 'admin']), listApplications);
router.get('/applications/:id', authenticate, authorize(['player', 'org', 'admin']), getApplication);
router.patch('/applications/:id', authenticate, authorize(['org', 'player', 'admin']), validate(updateApplicationSchema), updateApplicationStatus);


module.exports = router;
