interface CircuitBreakerConfig {
  failureThreshold: number
  resetTimeout: number
}

export class CircuitBreaker {
  private failures: number = 0
  private lastFailureTime: number = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    if (this.shouldReset()) {
      this.reset()
    }

    if (this.state === 'OPEN') {
      if (fallback) {
        return fallback()
      }
      throw new Error('Circuit breaker is open')
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      if (fallback) {
        return fallback()
      }
      throw error
    }
  }

  private shouldReset(): boolean {
    return (
      this.state === 'OPEN' &&
      Date.now() - this.lastFailureTime >= this.config.resetTimeout
    )
  }

  private reset(): void {
    this.failures = 0
    this.state = 'HALF_OPEN'
  }

  private onSuccess(): void {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    if (this.failures >= this.config.failureThreshold) {
      this.state = 'OPEN'
    }
  }
} 