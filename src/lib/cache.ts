import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

interface CacheOptions {
  ttl?: number // Time to live in seconds
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

export async function cacheSet(key: string, value: any, options: CacheOptions = {}) {
  try {
    const serialized = JSON.stringify(value)
    if (options.ttl) {
      await redis.setex(key, options.ttl, serialized)
    } else {
      await redis.set(key, serialized)
    }
    return true
  } catch (error) {
    console.error('Cache set error:', error)
    return false
  }
}

export async function cacheDelete(key: string) {
  try {
    await redis.del(key)
    return true
  } catch (error) {
    console.error('Cache delete error:', error)
    return false
  }
}

export function createCacheKey(...parts: string[]) {
  return parts.join(':')
}

interface CacheConfig {
  prefix?: string
  defaultTTL?: number
}

export class CacheManager {
  private prefix: string
  private defaultTTL: number

  constructor(config: CacheConfig = {}) {
    this.prefix = config.prefix || ''
    this.defaultTTL = config.defaultTTL || 300 // 5 minutes default
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key
  }

  async get<T>(key: string): Promise<T | null> {
    return cacheGet<T>(this.getKey(key))
  }

  async set(key: string, value: any, ttl?: number) {
    return cacheSet(this.getKey(key), value, { ttl: ttl || this.defaultTTL })
  }

  async delete(key: string) {
    return cacheDelete(this.getKey(key))
  }

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await fetchFn()
    await this.set(key, value, ttl)
    return value
  }

  async invalidatePattern(pattern: string) {
    try {
      const keys = await redis.keys(this.getKey(pattern))
      if (keys.length > 0) {
        await redis.del(...keys)
      }
      return true
    } catch (error) {
      console.error('Cache pattern invalidation error:', error)
      return false
    }
  }
}

// Create cache managers for different domains
export const workflowCache = new CacheManager({ prefix: 'workflows', defaultTTL: 300 })
export const userCache = new CacheManager({ prefix: 'users', defaultTTL: 3600 })
export const agentCache = new CacheManager({ prefix: 'agents', defaultTTL: 300 })

export class HierarchicalCache {
  private caches: CacheManager[]

  constructor(caches: CacheManager[]) {
    this.caches = caches
  }

  async get<T>(key: string): Promise<T | null> {
    for (const cache of this.caches) {
      const value = await cache.get<T>(key)
      if (value !== null) {
        // Propagate to higher-level caches
        for (let i = 0; i < this.caches.indexOf(cache); i++) {
          await this.caches[i].set(key, value)
        }
        return value
      }
    }
    return null
  }

  async set(key: string, value: any, ttl?: number) {
    for (const cache of this.caches) {
      await cache.set(key, value, ttl)
    }
  }

  async delete(key: string) {
    for (const cache of this.caches) {
      await cache.delete(key)
    }
  }
}

// Create memory cache for fastest access
export class MemoryCache extends CacheManager {
  private store = new Map<string, { value: any; expires: number }>()

  async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(this.getKey(key))
    if (!item) return null
    if (item.expires < Date.now()) {
      this.store.delete(this.getKey(key))
      return null
    }
    return item.value
  }

  async set(key: string, value: any, ttl?: number) {
    this.store.set(this.getKey(key), {
      value,
      expires: Date.now() + (ttl || this.defaultTTL) * 1000
    })
    return true
  }

  async delete(key: string) {
    this.store.delete(this.getKey(key))
    return true
  }
}

// Create hierarchical caches for different domains
export const memoryCache = new MemoryCache({ defaultTTL: 60 }) // 1 minute
export const hierarchicalWorkflowCache = new HierarchicalCache([
  memoryCache,
  workflowCache
])

export const enhancedWorkflowCache = new EnhancedCache(
  { prefix: 'workflows', defaultTTL: 300 },
  { staleAfter: 240, retryAfter: 60 } // Stale after 4 minutes, retry after 1 minute
)

export const enhancedHierarchicalWorkflowCache = new HierarchicalCache([
  memoryCache,
  enhancedWorkflowCache
]) 