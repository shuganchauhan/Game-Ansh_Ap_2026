const socialService = require('./social.service');

async function follow(req, res, next) {
  try { res.status(201).json({ status: 'success', data: await socialService.follow(req.user.id, req.body) }); }
  catch (err) { next(err); }
}

async function unfollow(req, res, next) {
  try { res.json({ status: 'success', data: await socialService.unfollow(req.user.id, req.body) }); }
  catch (err) { next(err); }
}

async function getFeed(req, res, next) {
  try { res.json({ status: 'success', data: await socialService.getFeed(req.user?.id) }); }
  catch (err) { next(err); }
}

async function createPost(req, res, next) {
  try { res.status(201).json({ status: 'success', data: await socialService.createPost(req.user, req.body) }); }
  catch (err) { next(err); }
}

async function getPost(req, res, next) {
  try { res.json({ status: 'success', data: await socialService.getPost(req.params.id, req.user?.id) }); }
  catch (err) { next(err); }
}

async function toggleLike(req, res, next) {
  try { res.json({ status: 'success', data: await socialService.toggleLike(req.params.id, req.user.id) }); }
  catch (err) { next(err); }
}

async function addComment(req, res, next) {
  try { res.status(201).json({ status: 'success', data: await socialService.addComment(req.params.id, req.user, req.body.content) }); }
  catch (err) { next(err); }
}

async function connectPlayers(req, res, next) {
  try { res.status(201).json({ status: 'success', data: await socialService.connectPlayers(req.user.id, req.params.targetPlayerId) }); }
  catch (err) { next(err); }
}

async function getConnections(req, res, next) {
  try { res.json({ status: 'success', data: await socialService.getConnections(req.user.id) }); }
  catch (err) { next(err); }
}

async function getFollows(req, res, next) {
  try { res.json({ status: 'success', data: await socialService.getFollows(req.user.id) }); }
  catch (err) { next(err); }
}

async function getRecommendedPlayers(req, res, next) {
  try { res.json({ status: 'success', data: await socialService.getRecommendedPlayers(req.user?.id) }); }
  catch (err) { next(err); }
}

module.exports = {
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
};
