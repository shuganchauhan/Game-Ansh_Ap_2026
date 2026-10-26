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

  // Only attach RedisStore if Redis is connected and ready; otherwise default to built-in in-memory store
  if (process.env.REDIS_URL && process.env.NODE_ENV !== 'test' && redis.status === 'ready') {
    try {
      options.store = new RedisStore({
        sendCommand: (...args) => redis.call(...args),
      });
      options.passOnStoreError = true;
    } catch {
      // Fallback to built-in memory store gracefully
    }
  }

  return rateLimit(options);
}

const writeLimiter = createLimiter(process.env.RATE_LIMIT_WINDOW_MS, process.env.RATE_LIMIT_MAX,
  'Too many requests, please try again later.');
const strictLimiter = createLimiter(process.env.STRICT_LIMIT_WINDOW_MS, process.env.STRICT_LIMIT_MAX,
  'Creation rate limit exceeded. Please wait before trying again.');
const authLimiter = createLimiter(process.env.AUTH_LIMIT_WINDOW_MS || 900000, process.env.AUTH_LIMIT_MAX || 10,
  'Too many authentication attempts. Please try again later.');

module.exports = { writeLimiter, strictLimiter, authLimiter };
