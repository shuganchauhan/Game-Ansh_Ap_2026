const { Router } = require('express');
const { signup, simpleSignup, login } = require('./auth.controller');
const { validate } = require('../../shared/validation');
const {
  simpleSignupSchema,
  loginSchema,
  playerSignupSchema,
  orgSignupSchema,
  organizerSignupSchema,
} = require('./auth.schema');

const router = Router();

function pickSignupSchema(req, res, next) {
  const { type } = req.params;
  if (type === 'player') return validate(playerSignupSchema)(req, res, next);
  if (type === 'org') return validate(orgSignupSchema)(req, res, next);
  if (type === 'organizer') return validate(organizerSignupSchema)(req, res, next);
  next();
}

// Simple frictionless signup (Just Email & Password)
router.post('/signup', validate(simpleSignupSchema), simpleSignup);
router.post('/register', validate(simpleSignupSchema), simpleSignup);

// Legacy/typed signup
router.post('/signup/:type', pickSignupSchema, signup);

// Login (email & password auto-detects admin, player, org, organizer)
router.post('/login', validate(loginSchema), login);

module.exports = router;
