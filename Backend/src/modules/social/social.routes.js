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
  getFollows,
  getRecommendedPlayers,
} = require('./social.controller');
const { authenticate, optionalAuthenticate, authorize } = require('../../shared/auth/middleware');
const { validate } = require('../../shared/validation');
const { followSchema, createPostSchema } = require('./social.schema');

const router = Router();

// Feed & Posts (Public reads, strictly protected writes)
router.get('/feed', optionalAuthenticate, getFeed);
router.post('/posts', authenticate, authorize(['player', 'org', 'organizer']), validate(createPostSchema), createPost);
router.get('/posts/:id', optionalAuthenticate, getPost);
router.post('/posts/:id/like', authenticate, toggleLike);
router.post('/posts/:id/comments', authenticate, addComment);

// Follow / Unfollow
router.post('/follow', authenticate, authorize('player'), validate(followSchema), follow);
router.delete('/follow', authenticate, authorize('player'), validate(followSchema), unfollow);
router.get('/follows', authenticate, authorize('player'), getFollows);

// Player-to-Player Connections (LinkedIn style)
router.post('/connections/:targetPlayerId', authenticate, authorize('player'), connectPlayers);
router.get('/connections', authenticate, authorize('player'), getConnections);
router.get('/players/recommended', authenticate, getRecommendedPlayers);

module.exports = router;
