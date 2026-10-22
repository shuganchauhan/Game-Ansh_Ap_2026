const { Router } = require('express');
const {
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
} = require('./tournaments.controller');
const { authenticate, authorize } = require('../../shared/auth/middleware');

const router = Router();

// Organizer Verification
router.post('/organizer/verification', authenticate, authorize(['organizer', 'player', 'org', 'admin', 'root']), submitOrganizerVerification);
router.get('/organizer/verification/status', authenticate, authorize(['organizer', 'player', 'org', 'admin', 'root']), getOrganizerVerificationStatus);

// Scrims
router.get('/scrims', listScrims);
router.post('/scrims', authenticate, authorize(['organizer', 'admin']), createScrim);
router.get('/scrims/:id', getScrimLobby);
router.patch('/scrims/:id/credentials', authenticate, authorize(['organizer', 'admin']), updateScrimCredentials);
router.post('/scrims/:id/register', authenticate, authorize(['player', 'org', 'admin']), registerTeamForScrim);
router.post('/scrims/:id/checkin/:teamId', authenticate, authorize(['player', 'org', 'organizer', 'admin']), updateScrimCheckin);

// Tournaments
router.post('/', authenticate, authorize('organizer'), createTournament);
router.get('/:id', getTournament);
router.patch('/:id', authenticate, authorize('organizer'), updateTournament);
router.post('/:id/register', authenticate, authorize(['org', 'player']), registerTeam);
router.get('/:id/registrations', authenticate, authorize('organizer'), getTournamentRegistrations);
router.patch('/:id/registrations/:regId', authenticate, authorize('organizer'), updateRegistration);

module.exports = router;
