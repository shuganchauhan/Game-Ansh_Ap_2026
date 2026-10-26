const orgsService = require('./orgs.service');

async function getOrg(req, res, next) {
  try { res.json({ status: 'success', data: await orgsService.getOrg(req.params.id) }); }
  catch (err) { next(err); }
}
async function updateOrg(req, res, next) {
  try { res.json({ status: 'success', data: await orgsService.updateOrg(req.params.id, req.user.id, req.body) }); }
  catch (err) { next(err); }
}
async function getOrgTeams(req, res, next) {
  try { res.json({ status: 'success', data: await orgsService.getOrgTeams(req.params.id, req.user.id, req.user.role) }); }
  catch (err) { next(err); }
}
async function getOrgPlayers(req, res, next) {
  try { res.json({ status: 'success', data: await orgsService.getOrgPlayers(req.params.id, req.user.id, req.user.role) }); }
  catch (err) { next(err); }
}
async function submitVerification(req, res, next) {
  try { res.status(201).json({ status: 'success', data: await orgsService.submitVerification(req.user.id, req.user.role, req.user.email, req.body) }); }
  catch (err) { next(err); }
}
async function getVerificationStatus(req, res, next) {
  try { res.json({ status: 'success', data: await orgsService.getVerificationStatus(req.user.id, req.user.role, req.user.email) }); }
  catch (err) { next(err); }
}

module.exports = { getOrg, updateOrg, getOrgTeams, getOrgPlayers, submitVerification, getVerificationStatus };
