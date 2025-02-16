import { CacheManager } from './cache'
import { CircuitBreaker } from './circuit-breaker'

interface StaleWhileRevalidateConfig {
  staleAfter: number // Time in seconds after which data is considered stale
  retryAfter: number // Time in seconds to wait before retrying failed revalidation
}

export class EnhancedCache extends CacheManager {
  private circuitBreaker: CircuitBreaker
  private revalidating = new Set<string>()

  constructor(
    config: { prefix?: string; defaultTTL?: number },
    private swrConfig: StaleWhileRevalidateConfig
  ) {
    super(config)
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 30000, // 30 seconds
    })
  }

  async getWithSWR<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cacheKey = this.getKey(key)
    const now = Date.now()

    try {
      const cached = await this.get<{ value: T; timestamp: number }>(key)

      if (cached) {
        const age = now - cached.timestamp
        
        // Data is fresh
        if (age < (ttl || this.defaultTTL) * 1000) {
          return cached.value
        }

        // Data is stale but not yet revalidating
        if (!this.revalidating.has(cacheKey)) {
          this.revalidating.add(cacheKey)
          
          // Background revalidation
          this.circuitBreaker
            .execute(async () => {
              const fresh = await fetchFn()
              await this.set(key, { value: fresh, timestamp: now }, ttl)
              return fresh
            })
            .catch(console.error)
            .finally(() => {
              this.revalidating.delete(cacheKey)
            })
        }

        // Return stale data while revalidating
        return cached.value
      }

      // No cached data, fetch fresh
      const fresh = await this.circuitBreaker.execute(fetchFn)
      await this.set(key, { value: fresh, timestamp: now }, ttl)
      return fresh
    } catch (error) {
      console.error('Enhanced cache error:', error)
      throw error
    }
  }
} 