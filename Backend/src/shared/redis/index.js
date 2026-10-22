require('dotenv').config();
const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  enableOfflineQueue: false,
  retryStrategy: (times) => {
    if (times > 2) return null; // do not endlessly loop if redis is down
    return 1000;
  },
});

let isReady = false;

redis.on('error', (err) => {
  // Only log if was previously connected to avoid console spam
  if (isReady) {
    console.warn('[Redis] Connection lost:', err.message);
  }
  isReady = false;
});

redis.on('connect', () => {
  isReady = true;
  console.log('[Redis] Connected successfully');
});

redis.on('ready', () => {
  isReady = true;
});

redis.isReady = () => isReady;

module.exports = redis;
