/**
 * FLUX URL Router & Navigation Engine
 * Provides clean semantic URLs, browser history (back/forward), deep-linking, and route parsing.
 */

export const TAB_PATHS = {
  landing: '/',
  discovery: '/discover',
  tournaments: '/tournaments',
  teams: '/teams',
  feed: '/feed',
  organizer: '/organizations',
  dashboard: '/dashboard',
  profile: '/profile',
  onboarding: '/onboarding',
  applications: '/applications',
  admin: '/admin',
  'scrim-lobby': '/scrims',
};

export function parsePath(pathname) {
  const clean = (pathname || '/').replace(/\/+$/, '') || '/';

  if (clean === '/' || clean === '/home') {
    return { tab: 'landing', scrimId: null };
  }

  if (clean === '/auth/callback' || clean === '/auth/google/callback') {
    return { tab: 'auth-callback', scrimId: null };
  }

  // Scrims lobby: /scrims/:id or /tournaments/scrims/:id
  const scrimMatch = clean.match(/^\/(?:tournaments\/)?scrims\/(.+)$/);
  if (scrimMatch) {
    return { tab: 'scrim-lobby', scrimId: decodeURIComponent(scrimMatch[1]) };
  }
  if (clean === '/scrims') {
    return { tab: 'tournaments', scrimId: null };
  }

  if (clean === '/discover' || clean === '/discovery') {
    return { tab: 'discovery', scrimId: null };
  }
  if (clean === '/tournaments') {
    return { tab: 'tournaments', scrimId: null };
  }
  if (clean === '/teams' || clean === '/squads') {
    return { tab: 'teams', scrimId: null };
  }
  if (clean === '/feed' || clean === '/community') {
    return { tab: 'feed', scrimId: null };
  }
  if (clean === '/organizations' || clean === '/organizer' || clean === '/orgs') {
    return { tab: 'organizer', scrimId: null };
  }
  if (clean === '/dashboard') {
    return { tab: 'dashboard', scrimId: null };
  }
  if (clean === '/profile' || clean === '/passport') {
    return { tab: 'profile', scrimId: null };
  }
  if (clean === '/onboarding') {
    return { tab: 'onboarding', scrimId: null };
  }
  if (clean === '/applications') {
    return { tab: 'applications', scrimId: null };
  }
  if (clean === '/admin') {
    return { tab: 'admin', scrimId: null };
  }

  return { tab: 'landing', scrimId: null };
}

export function formatPath(tab, { scrimId } = {}) {
  if (tab === 'scrim-lobby' && scrimId) {
    return `/scrims/${encodeURIComponent(scrimId)}`;
  }
  return TAB_PATHS[tab] || '/';
}
