/**
 * Mock Redis for Demo Environment
 * In-memory fallback when Redis is unavailable
 * Zero infrastructure dependencies
 */

interface CacheEntry {
  value: string;
  expiresAt: number | null;
}

class RedisMock {
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * Get value from cache
   */
  async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set value in cache with optional TTL
   */
  async set(key: string, value: string, mode?: string, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
    
    this.cache.set(key, {
      value,
      expiresAt
    });
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<number> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return 0;
    }

    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return 0;
    }

    return 1;
  }

  /**
   * Delete key
   */
  async del(key: string): Promise<number> {
    return this.cache.delete(key) ? 1 : 0;
  }

  /**
   * Clear expired entries (memory management)
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; keys: string[] } {
    this.cleanup();
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const redisMock = new RedisMock();

// Auto-cleanup every 5 minutes
setInterval(() => {
  const stats = redisMock.getStats();
  console.log(`[Redis Mock] Cleanup: ${stats.size} keys in cache`);
}, 300000);
