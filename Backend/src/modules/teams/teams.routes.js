const { Router } = require('express');
const {
  createTeam, getTeam, listTeams, updateTeam, addMember, removeMember,
  inviteMember, listTeamInvitations, cancelInvitation, listMyInvitations, respondInvitation,
} = require('./teams.controller');
const { authenticate, authorize } = require('../../shared/auth/middleware');
const { validate } = require('../../shared/validation');
const { createTeamSchema, addMemberSchema, inviteMemberSchema, respondInviteSchema } = require('./teams.schema');

const router = Router();

// Invitations for current logged-in player
router.get('/invitations/my', authenticate, authorize(['player', 'org', 'admin']), listMyInvitations);
router.post('/invitations/:inviteId/respond', authenticate, authorize(['player', 'org', 'admin']), validate(respondInviteSchema), respondInvitation);

router.get('/', listTeams);
router.post('/', authenticate, authorize(['player', 'org', 'admin']), validate(createTeamSchema), createTeam);
router.get('/:id', getTeam);
router.put('/:id', authenticate, authorize(['player', 'org', 'admin']), updateTeam);

// Team Invitations (Captain / Org Management)
router.post('/:id/invitations', authenticate, authorize(['player', 'org', 'admin']), validate(inviteMemberSchema), inviteMember);
router.get('/:id/invitations', authenticate, authorize(['player', 'org', 'admin']), listTeamInvitations);
router.delete('/:id/invitations/:inviteId', authenticate, authorize(['player', 'org', 'admin']), cancelInvitation);

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
