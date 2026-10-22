require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { globalErrorHandler } = require('./shared/errors');

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

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static assets
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/auth', authRoutes);
app.use('/players', playersRoutes);
app.use('/orgs', orgsRoutes);
app.use('/teams', teamsRoutes);
app.use('/', recruitmentRoutes);       // /teams/:id/postings, /postings/:id/apply, /applications/:id
app.use('/discovery', discoveryRoutes);
app.use('/social', socialRoutes);
app.use('/', socialRoutes);             // /follow, /feed, /posts
app.use('/messages', messagingRoutes);
app.use('/tournaments', tournamentsRoutes);
app.use('/admin', adminRoutes);
app.use('/uploads', uploadsRoutes);

app.use((_req, res) => res.status(404).json({ status: 'error', message: 'Route not found' }));
app.use(globalErrorHandler);

module.exports = app;
