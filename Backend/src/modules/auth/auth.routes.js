const { Router } = require('express');
const passport = require('passport');
const { signToken } = require('../../shared/auth/jwt');
const { authLimiter } = require('../../shared/ratelimit');
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
router.post('/signup', authLimiter, validate(simpleSignupSchema), simpleSignup);
router.post('/register', authLimiter, validate(simpleSignupSchema), simpleSignup);

// Legacy/typed signup
router.post('/signup/:type', authLimiter, pickSignupSchema, signup);

// Login (email & password auto-detects admin, player, org, organizer)
router.post('/login', authLimiter, validate(loginSchema), login);

// Google OAuth 2.0 (Initiate)
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      status: 'error',
      message: 'Google OAuth is not configured on this server. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables.',
    });
  }
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account',
  })(req, res, next);
});

// Google OAuth 2.0 (Callback)
router.get('/google/callback', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      status: 'error',
      message: 'Google OAuth is not configured on this server.',
    });
  }

  passport.authenticate('google', { session: false }, (err, user, info) => {
    const frontendBase = process.env.FRONTEND_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://game-ansh-ap-2026.vercel.app'
        : 'http://localhost:5173');

    if (err || !user) {
      const errorMsg = encodeURIComponent(err?.message || info?.message || 'Google authentication failed');
      return res.redirect(`${frontendBase}/auth/callback?error=${errorMsg}`);
    }

    const token = signToken({ id: user.id, role: user.role || 'player', email: user.email });
    const safeName = encodeURIComponent(user.name || user.username || user.game_ign || 'Athlete');
    const safeEmail = encodeURIComponent(user.email || '');
    const safeRole = encodeURIComponent(user.role || 'player');
    const safeId = encodeURIComponent(user.id);
    const safeAvatar = encodeURIComponent(user.avatar_url || '');

    return res.redirect(
      `${frontendBase}/auth/callback?token=${token}&id=${safeId}&role=${safeRole}&name=${safeName}&email=${safeEmail}&avatar=${safeAvatar}`
    );
  })(req, res, next);
});

module.exports = router;
