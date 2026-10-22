const { Router } = require('express');
const {
  follow,
  unfollow,
  getFeed,
  createPost,
  getPost,
  toggleLike,
  addComment,
  connectPlayers,
  getConnections,
  getRecommendedPlayers,
} = require('./social.controller');
const { authenticate, authorize } = require('../../shared/auth/middleware');
const { validate } = require('../../shared/validation');
const { followSchema, createPostSchema } = require('./social.schema');

const router = Router();

// Feed & Posts
router.get('/feed', authenticate, getFeed);
router.post('/posts', authenticate, authorize(['player', 'org', 'organizer', 'admin']), validate(createPostSchema), createPost);
router.get('/posts/:id', authenticate, getPost);
router.post('/posts/:id/like', authenticate, toggleLike);
router.post('/posts/:id/comments', authenticate, addComment);

// Follow / Unfollow
router.post('/follow', authenticate, authorize('player'), validate(followSchema), follow);
router.delete('/follow', authenticate, authorize('player'), validate(followSchema), unfollow);

// Player-to-Player Connections (LinkedIn style)
router.post('/connections/:targetPlayerId', authenticate, authorize('player'), connectPlayers);
router.get('/connections', authenticate, authorize('player'), getConnections);
router.get('/players/recommended', authenticate, getRecommendedPlayers);

module.exports = router;
