const { Router } = require('express');
const { createTeam, getTeam, listTeams, updateTeam, addMember, removeMember } = require('./teams.controller');
const { authenticate, authorize } = require('../../shared/auth/middleware');
const { validate } = require('../../shared/validation');
const { createTeamSchema, addMemberSchema } = require('./teams.schema');

const router = Router();

router.get('/', listTeams);
router.post('/', authenticate, authorize(['player', 'org', 'admin']), validate(createTeamSchema), createTeam);
router.get('/:id', getTeam);
router.put('/:id', authenticate, authorize(['player', 'org', 'admin']), updateTeam);
router.post('/:id/members', authenticate, authorize(['player', 'org', 'admin']), validate(addMemberSchema), addMember);
router.delete('/:id/members/:memberId', authenticate, authorize(['player', 'org', 'admin']), removeMember);

// Backwards compatibility for /:id/players
router.post('/:id/players', authenticate, authorize(['player', 'org', 'admin']), (req, res, next) => {
  if (req.body.player_id && !req.body.name) {
    req.body.name = 'Roster Member';
    req.body.ign = 'Player';
  }
  return addMember(req, res, next);
});
router.delete('/:id/players/:playerId', authenticate, authorize(['player', 'org', 'admin']), removeMember);

module.exports = router;
