import { Redis } from '@upstash/redis';

/**
 * Upstash Redis instance for Vercel
 * Optimized for serverless environments with HTTP-based connection
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Helper functions for HackMatch logic
export const redisKeys = {
  userSwipes: (userId: string) => `user:${userId}:swipes`,
  matchPool: (university: string) => `university:${university}:matches`,
  realtimeChat: (chatId: string) => `chat:${chatId}:presence`,
};
