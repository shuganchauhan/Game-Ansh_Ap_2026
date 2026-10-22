const { Router } = require('express');
const {
  getStats,
  listOrgVerifications,
  approveOrgVerification,
  rejectOrgVerification,
  listOrganizerVerifications,
  approveOrganizerVerification,
  rejectOrganizerVerification,
  verifyOrg,
  verifyOrganizer,
  listUsers,
} = require('./admin.controller');
const { authenticate, authorize } = require('../../shared/auth/middleware');

const router = Router();

router.use(authenticate, authorize(['admin', 'root']));

router.get('/stats', getStats);

// Org verifications
router.get('/verifications/orgs', listOrgVerifications);
router.patch('/verifications/orgs/:id/approve', approveOrgVerification);
router.patch('/verifications/orgs/:id/reject', rejectOrgVerification);

// Organizer verifications
router.get('/verifications/organizers', listOrganizerVerifications);
router.patch('/verifications/organizers/:id/approve', approveOrganizerVerification);
router.patch('/verifications/organizers/:id/reject', rejectOrganizerVerification);

// Direct legacy endpoints
router.patch('/orgs/:id/verify', verifyOrg);
router.patch('/organizers/:id/verify', verifyOrganizer);
router.get('/users', listUsers);

module.exports = router;
