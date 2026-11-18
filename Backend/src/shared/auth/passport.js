const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { query } = require('../db');

const clientID = process.env.GOOGLE_CLIENT_ID?.trim();
const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

const callbackURL = process.env.GOOGLE_CALLBACK_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://game-ansh-ap-2026.onrender.com/api/auth/google/callback'
    : 'http://localhost:3000/api/auth/google/callback');

if (clientID && clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value?.trim().toLowerCase();
          const displayName = profile.displayName || profile.name?.givenName || 'Gamer Athlete';
          const avatarUrl = profile.photos?.[0]?.value || '';

          if (!email) {
            return done(new Error('No verified email associated with this Google account'), null);
          }

          // 1. Check if user already linked with this google_id
          const existingByGoogle = await query(
            'SELECT id, username, email, game_ign, avatar_url, team_id, org_id FROM player WHERE google_id = $1',
            [googleId],
          );

          if (existingByGoogle.rowCount > 0) {
            const player = existingByGoogle.rows[0];
            // Update avatar if missing
            if (!player.avatar_url && avatarUrl) {
              await query('UPDATE player SET avatar_url = $1 WHERE id = $2', [avatarUrl, player.id]);
              player.avatar_url = avatarUrl;
            }
            return done(null, { ...player, role: 'player' });
          }

          // 2. Check if user exists by email (link existing account)
          const existingByEmail = await query(
            'SELECT id, username, email, game_ign, avatar_url, team_id, org_id FROM player WHERE LOWER(email) = LOWER($1)',
            [email],
          );

          if (existingByEmail.rowCount > 0) {
            const player = existingByEmail.rows[0];
            const updated = await query(
              `UPDATE player
               SET google_id = $1,
                   avatar_url = COALESCE(NULLIF(avatar_url, ''), $2)
               WHERE id = $3
               RETURNING id, username, email, game_ign, avatar_url, team_id, org_id`,
              [googleId, avatarUrl, player.id],
            );
            return done(null, { ...updated.rows[0], role: 'player' });
          }

          // 3. Auto-provision new player account
          let baseUsername = displayName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .slice(0, 20);
          if (!baseUsername || baseUsername.length < 3) {
            baseUsername = (email.split('@')[0] || 'gamer').replace(/[^a-z0-9]/g, '').slice(0, 20);
          }

          // Ensure unique username
          let username = baseUsername;
          const userCheck = await query('SELECT 1 FROM player WHERE LOWER(username) = LOWER($1)', [username]);
          if (userCheck.rowCount > 0) {
            const randSuffix = Math.floor(1000 + Math.random() * 9000);
            username = `${baseUsername.slice(0, 15)}_${randSuffix}`;
          }

          const insertRes = await query(
            `INSERT INTO player (username, email, google_id, avatar_url, game_ign)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, username, email, game_ign, avatar_url, team_id, org_id`,
            [username, email, googleId, avatarUrl, displayName],
          );

          return done(null, { ...insertRes.rows[0], role: 'player' });
        } catch (err) {
          console.error('[Passport Google Strategy Error]:', err);
          return done(err, null);
        }
      },
    ),
  );
  console.log('[Passport] Google OAuth 2.0 Strategy registered with callback:', callbackURL);
} else {
  console.warn('[Passport] Google OAuth client ID/secret missing in env. Google login routes will return 503 until configured.');
}

module.exports = passport;
