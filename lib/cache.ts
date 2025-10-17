// Cache Layer using Vercel KV (Redis-compatible)
// Fallback to in-memory cache for development

interface CacheInterface {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

// Vercel KV implementation (production)
class VercelKVCache implements CacheInterface {
  private kv: any;

  constructor() {
    // Initialize Vercel KV client
    if (typeof window === 'undefined' && process.env.KV_URL) {
      // Server-side only
      this.kv = require('@vercel/kv').kv;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.kv) return null;
    try {
      return await this.kv.get(key);
    } catch (error) {
      console.error('KV get error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    if (!this.kv) return;
    try {
      await this.kv.set(key, value, { ex: ttl });
    } catch (error) {
      console.error('KV set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.kv) return;
    try {
      await this.kv.del(key);
    } catch (error) {
      console.error('KV del error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.kv) return false;
    try {
      const result = await this.kv.exists(key);
      return result === 1;
    } catch (error) {
      console.error('KV exists error:', error);
      return false;
    }
  }
}

// In-memory cache implementation (development fallback)
class MemoryCache implements CacheInterface {
  private cache = new Map<string, { value: string; expires: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    return item ? Date.now() <= item.expires : false;
  }
}

// Cache factory
function createCache(): CacheInterface {
  if (process.env.KV_URL && typeof window === 'undefined') {
    return new VercelKVCache();
  }
  return new MemoryCache();
}

export const cache = createCache();

// Cache key generators
export const CacheKeys = {
  AI_RESPONSE: (hash: string) => `ai_response:${hash}`,
  USER_SUMMARY: (userId: string) => `user_summary:${userId}`,
  LEVEL_TEMPLATE: (craving: string, level: number) => `level:${craving}:${level}`,
  FORUM_TEMPLATE: (topic: string) => `forum_template:${topic}`,
  BATTLE_TASKS: (craving: string) => `battle_tasks:${craving}`,
  USER_QUOTA: (userId: string, date: string) => `quota:${userId}:${date}`,
  RATE_LIMIT: (userId: string, endpoint: string) => `rate:${userId}:${endpoint}`,
} as const;

// Cache TTL constants (in seconds)
export const CacheTTL = {
  AI_RESPONSE_NANO: 24 * 60 * 60, // 24 hours
  AI_RESPONSE_MINI: 7 * 24 * 60 * 60, // 7 days
  USER_SUMMARY: 7 * 24 * 60 * 60, // 7 days
  LEVEL_TEMPLATE: 30 * 24 * 60 * 60, // 30 days
  FORUM_TEMPLATE: 30 * 24 * 60 * 60, // 30 days
  BATTLE_TASKS: 7 * 24 * 60 * 60, // 7 days
  USER_QUOTA: 24 * 60 * 60, // 24 hours
  RATE_LIMIT: 60, // 1 minute
} as const;

// Cache utility functions
export class CacheManager {
  // Get cached AI response
  static async getAIResponse(promptHash: string): Promise<string | null> {
    return await cache.get(CacheKeys.AI_RESPONSE(promptHash));
  }

  // Set cached AI response
  static async setAIResponse(
    promptHash: string,
    response: string,
    model: 'gpt-5-nano' | 'gpt-5-mini'
  ): Promise<void> {
    const ttl = model === 'gpt-5-nano' 
      ? CacheTTL.AI_RESPONSE_NANO 
      : CacheTTL.AI_RESPONSE_MINI;
    await cache.set(CacheKeys.AI_RESPONSE(promptHash), response, ttl);
  }

  // Get cached user summary
  static async getUserSummary(userId: string): Promise<string | null> {
    return await cache.get(CacheKeys.USER_SUMMARY(userId));
  }

  // Set cached user summary
  static async setUserSummary(userId: string, summary: string): Promise<void> {
    await cache.set(CacheKeys.USER_SUMMARY(userId), summary, CacheTTL.USER_SUMMARY);
  }

  // Get cached level template
  static async getLevelTemplate(craving: string, level: number): Promise<string | null> {
    return await cache.get(CacheKeys.LEVEL_TEMPLATE(craving, level));
  }

  // Set cached level template
  static async setLevelTemplate(craving: string, level: number, template: string): Promise<void> {
    await cache.set(CacheKeys.LEVEL_TEMPLATE(craving, level), template, CacheTTL.LEVEL_TEMPLATE);
  }

  // Get cached forum template
  static async getForumTemplate(topic: string): Promise<string | null> {
    return await cache.get(CacheKeys.FORUM_TEMPLATE(topic));
  }

  // Set cached forum template
  static async setForumTemplate(topic: string, template: string): Promise<void> {
    await cache.set(CacheKeys.FORUM_TEMPLATE(topic), template, CacheTTL.FORUM_TEMPLATE);
  }

  // Get cached battle tasks
  static async getBattleTasks(craving: string): Promise<string[] | null> {
    const cached = await cache.get(CacheKeys.BATTLE_TASKS(craving));
    return cached ? JSON.parse(cached) : null;
  }

  // Set cached battle tasks
  static async setBattleTasks(craving: string, tasks: string[]): Promise<void> {
    await cache.set(CacheKeys.BATTLE_TASKS(craving), JSON.stringify(tasks), CacheTTL.BATTLE_TASKS);
  }

  // Get user quota for today
  static async getUserQuota(userId: string, date: string): Promise<number> {
    const cached = await cache.get(CacheKeys.USER_QUOTA(userId, date));
    return cached ? parseInt(cached) : 0;
  }

  // Set user quota for today
  static async setUserQuota(userId: string, date: string, count: number): Promise<void> {
    await cache.set(CacheKeys.USER_QUOTA(userId, date), count.toString(), CacheTTL.USER_QUOTA);
  }

  // Increment user quota
  static async incrementUserQuota(userId: string, date: string): Promise<number> {
    const current = await this.getUserQuota(userId, date);
    const newCount = current + 1;
    await this.setUserQuota(userId, date, newCount);
    return newCount;
  }

  // Check rate limit
  static async checkRateLimit(userId: string, endpoint: string): Promise<boolean> {
    const key = CacheKeys.RATE_LIMIT(userId, endpoint);
    const exists = await cache.exists(key);
    return !exists;
  }

  // Set rate limit
  static async setRateLimit(userId: string, endpoint: string): Promise<void> {
    const key = CacheKeys.RATE_LIMIT(userId, endpoint);
    await cache.set(key, '1', CacheTTL.RATE_LIMIT);
  }

  // Clear all cache for a user (useful for testing or account deletion)
  static async clearUserCache(userId: string): Promise<void> {
    const patterns = [
      CacheKeys.USER_SUMMARY(userId),
      CacheKeys.USER_QUOTA(userId, '*'),
      CacheKeys.RATE_LIMIT(userId, '*'),
    ];

    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        // In a real implementation, you'd use SCAN to find matching keys
        // For now, we'll just clear the specific patterns we know
        continue;
      }
      await cache.del(pattern);
    }
  }

  // Get cache statistics (for monitoring)
  static async getCacheStats(): Promise<{
    hitRate: number;
    totalKeys: number;
    memoryUsage: string;
  }> {
    // This would be implemented differently for Vercel KV vs Memory cache
    // For now, return mock stats
    return {
      hitRate: 0.85,
      totalKeys: 0,
      memoryUsage: '0MB',
    };
  }
}

// Cache warming utilities
export class CacheWarmer {
  // Warm up level templates
  static async warmLevelTemplates(): Promise<void> {
    const cravings = ['nofap', 'sugar', 'shopping', 'smoking_vaping', 'social_media'];
    
    for (const craving of cravings) {
      for (let level = 1; level <= 30; level++) {
        const cached = await CacheManager.getLevelTemplate(craving, level);
        if (!cached) {
          // In production, this would fetch from database and cache
          console.log(`Warming cache for ${craving} level ${level}`);
        }
      }
    }
  }

  // Warm up forum templates
  static async warmForumTemplates(): Promise<void> {
    const commonTopics = [
      'relapse recovery',
      'streak celebration',
      'motivation boost',
      'trigger management',
      'progress sharing',
    ];

    for (const topic of commonTopics) {
      const cached = await CacheManager.getForumTemplate(topic);
      if (!cached) {
        // In production, this would generate and cache templates
        console.log(`Warming cache for forum topic: ${topic}`);
      }
    }
  }

  // Warm up battle tasks
  static async warmBattleTasks(): Promise<void> {
    const cravings = ['nofap', 'sugar', 'shopping', 'smoking_vaping', 'social_media'];
    
    for (const craving of cravings) {
      const cached = await CacheManager.getBattleTasks(craving);
      if (!cached) {
        // In production, this would generate and cache tasks
        console.log(`Warming cache for battle tasks: ${craving}`);
      }
    }
  }
}
