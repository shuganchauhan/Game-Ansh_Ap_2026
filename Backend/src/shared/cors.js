function isAllowedOrigin(origin) {
  if (!origin) return true;

  const configured = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  // Exact match against explicit origins (or wildcard in non-production)
  if (configured.includes(origin) || configured.includes('*')) return true;

  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.vercel.app') ||
      host.endsWith('.onrender.com') ||
      host.endsWith('.netlify.app')
    ) {
      return true;
    }
  } catch {
    const lower = origin.toLowerCase();
    if (lower.endsWith('.vercel.app') || lower.endsWith('.onrender.com') || lower.endsWith('.netlify.app')) {
      return true;
    }
  }

  return false;
}

const corsOriginDelegate = (origin, callback) => {
  if (process.env.NODE_ENV !== 'production' || isAllowedOrigin(origin)) {
    callback(null, true);
  } else {
    callback(new Error(`CORS blocked: Origin ${origin} is not permitted.`));
  }
};

module.exports = { isAllowedOrigin, corsOriginDelegate };
