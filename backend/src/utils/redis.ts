// Redis temporarily disabled - not needed for current implementation
// Uncomment and configure if you need Redis for caching or session management

/*
import { createClient } from 'redis';

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Redis connected successfully'));

export const connectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export const getRedisClient = () => redisClient;

export default redisClient;
*/

// Placeholder functions to prevent import errors (returns no-op)
export const connectRedis = async (): Promise<void> => {
  console.log('⚠️  Redis is disabled - skipping connection');
  // No-op: Redis not needed for now
};

export const getRedisClient = () => {
  throw new Error('Redis is disabled. Enable it in redis.ts if needed.');
};

export default null;