const adminService = require('./admin.service');

async function getStats(req, res, next) {
  try {
    const data = await adminService.getStats();
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function listOrgVerifications(req, res, next) {
  try {
    const data = await adminService.listOrgVerifications(req.query.status);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function approveOrgVerification(req, res, next) {
  try {
    const data = await adminService.approveOrgVerification(req.params.id, req.user?.id);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function rejectOrgVerification(req, res, next) {
  try {
    const data = await adminService.rejectOrgVerification(req.params.id, req.user?.id, req.body.review_notes);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function listOrganizerVerifications(req, res, next) {
  try {
    const data = await adminService.listOrganizerVerifications(req.query.status);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function approveOrganizerVerification(req, res, next) {
  try {
    const data = await adminService.approveOrganizerVerification(req.params.id, req.user?.id);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function rejectOrganizerVerification(req, res, next) {
  try {
    const data = await adminService.rejectOrganizerVerification(req.params.id, req.user?.id, req.body.review_notes);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function verifyOrg(req, res, next) {
  try {
    const data = await adminService.verifyOrg(req.params.id);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function verifyOrganizer(req, res, next) {
  try {
    const data = await adminService.verifyOrganizer(req.params.id);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const data = await adminService.listUsers();
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
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
};
