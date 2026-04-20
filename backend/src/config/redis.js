import { Redis } from '@upstash/redis';

let redis;

export async function connectRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required');
  }

  redis = new Redis({ url, token });

  // Verify connection
  await redis.ping();
  console.log('Redis connected');
}

export function getRedis() {
  if (!redis) throw new Error('Redis not initialized');
  return redis;
}
