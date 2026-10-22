const teamsService = require('./teams.service');

async function createTeam(req, res, next) {
  try {
    const data = await teamsService.createTeam(req.user, req.body);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function getTeam(req, res, next) {
  try {
    const data = await teamsService.getTeam(req.params.id);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function listTeams(req, res, next) {
  try {
    const data = await teamsService.listTeams(req.query);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function updateTeam(req, res, next) {
  try {
    const data = await teamsService.updateTeam(req.params.id, req.user, req.body);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function addMember(req, res, next) {
  try {
    const data = await teamsService.addMember(req.params.id, req.user, req.body);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function removeMember(req, res, next) {
  try {
    const data = await teamsService.removeMember(req.params.id, req.params.memberId, req.user);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTeam,
  getTeam,
  listTeams,
  updateTeam,
  addMember,
  removeMember,
};
