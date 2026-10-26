const tournamentsService = require('./tournaments.service');

async function submitOrganizerVerification(req, res, next) {
  try {
    const data = await tournamentsService.submitOrganizerVerification(req.user.id, req.user.role, req.user.email, req.body);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function getOrganizerVerificationStatus(req, res, next) {
  try {
    const data = await tournamentsService.getOrganizerVerificationStatus(req.user.id, req.user.role, req.user.email);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function createScrim(req, res, next) {
  try {
    const data = await tournamentsService.createScrim(req.user.id, req.body);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function listScrims(req, res, next) {
  try {
    const data = await tournamentsService.listScrims(req.query);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function getScrimLobby(req, res, next) {
  try {
    const data = await tournamentsService.getScrimLobby(req.params.id, req.user);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function updateScrimCredentials(req, res, next) {
  try {
    const data = await tournamentsService.updateScrimCredentials(req.params.id, req.user, req.body);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function registerTeamForScrim(req, res, next) {
  try {
    const data = await tournamentsService.registerTeamForScrim(req.params.id, req.body.team_id, req.user);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function updateScrimCheckin(req, res, next) {
  try {
    const data = await tournamentsService.updateScrimCheckin(req.params.id, req.params.teamId, req.user, req.body.check_in_status);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

// Tournaments
async function createTournament(req, res, next) {
  try {
    const data = await tournamentsService.createTournament(req.user.id, req.body);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function getTournament(req, res, next) {
  try {
    const data = await tournamentsService.getTournament(req.params.id);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function updateTournament(req, res, next) {
  try {
    const data = await tournamentsService.updateTournament(req.params.id, req.user.id, req.body);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function registerTeam(req, res, next) {
  try {
    const data = await tournamentsService.registerTeam(req.params.id, req.body.team_id, req.user);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function getTournamentRegistrations(req, res, next) {
  try {
    const data = await tournamentsService.getTournamentRegistrations(req.params.id, req.user.id);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function updateRegistration(req, res, next) {
  try {
    const data = await tournamentsService.updateRegistration(req.params.id, req.params.regId, req.user.id, req.body);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitOrganizerVerification,
  getOrganizerVerificationStatus,
  createScrim,
  listScrims,
  getScrimLobby,
  updateScrimCredentials,
  registerTeamForScrim,
  updateScrimCheckin,
  createTournament,
  getTournament,
  updateTournament,
  registerTeam,
  getTournamentRegistrations,
  updateRegistration,
};
