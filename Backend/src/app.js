require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { globalErrorHandler } = require('./shared/errors');
const { query } = require('./shared/db');

const authRoutes = require('./modules/auth/auth.routes');
const playersRoutes = require('./modules/players/players.routes');
const orgsRoutes = require('./modules/orgs/orgs.routes');
const teamsRoutes = require('./modules/teams/teams.routes');
const recruitmentRoutes = require('./modules/recruitment/recruitment.routes');
const discoveryRoutes = require('./modules/discovery/discovery.routes');
const socialRoutes = require('./modules/social/social.routes');
const messagingRoutes = require('./modules/messaging/messaging.routes');
const tournamentsRoutes = require('./modules/tournaments/tournaments.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const uploadsRoutes = require('./modules/uploads/uploads.routes');
const path = require('path');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean);
if (process.env.NODE_ENV === 'production' && allowedOrigins.some((origin) => origin === '*')) {
  throw new Error('CORS_ORIGINS must list explicit trusted origins in production.');
}
const corsOrigin = process.env.NODE_ENV === 'production'
  ? (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))
  : true;

app.set('trust proxy', Number(process.env.TRUST_PROXY) || 0);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: corsOrigin }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static assets
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/ready', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not_ready' });
  }
});

const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/players', playersRoutes);
apiRouter.use('/orgs', orgsRoutes);
apiRouter.use('/teams', teamsRoutes);
apiRouter.use('/', recruitmentRoutes);       // /teams/:id/postings, /postings/:id/apply, /applications/:id
apiRouter.use('/discovery', discoveryRoutes);
apiRouter.use('/social', socialRoutes);
apiRouter.use('/', socialRoutes);             // /follow, /feed, /posts
apiRouter.use('/messages', messagingRoutes);
apiRouter.use('/tournaments', tournamentsRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/uploads', uploadsRoutes);

app.use('/api', apiRouter);
app.use('/', apiRouter);

app.use((_req, res) => res.status(404).json({ status: 'error', message: 'Route not found' }));
app.use(globalErrorHandler);

module.exports = app;
