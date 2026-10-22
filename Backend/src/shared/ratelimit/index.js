const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redis = require('../redis');

function createLimiter(windowMs, max, message) {
  const options = {
    windowMs: Number(windowMs) || 900000,
    max: Number(max) || 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message },
  };

  // Only use Redis store if Redis is connected
  if (redis.status === 'ready' || redis.status === 'connect') {
    options.store = new RedisStore({
      sendCommand: (...args) => redis.call(...args),
    });
  }

  return rateLimit(options);
}

const writeLimiter = (req, res, next) => {
  const limiter = createLimiter(
    process.env.RATE_LIMIT_WINDOW_MS,
    process.env.RATE_LIMIT_MAX,
    'Too many requests, please try again later.'
  );
  return limiter(req, res, next);
};

const strictLimiter = (req, res, next) => {
  const limiter = createLimiter(
    process.env.STRICT_LIMIT_WINDOW_MS,
    process.env.STRICT_LIMIT_MAX,
    'Creation rate limit exceeded. Please wait before trying again.'
  );
  return limiter(req, res, next);
};

module.exports = { writeLimiter, strictLimiter };
