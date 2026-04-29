interface Entry {
  value: string
  expiresAt: number
}

// In-memory store. Resets on server restart — fine for rate limiting.
// For multi-instance deployments, swap this for Redis or a database backend.
const store = new Map<string, Entry>()

export const kvCache = {
  async get(key: string): Promise<string | null> {
    const entry = store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      store.delete(key)
      return null
    }
    return entry.value
  },

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
  },

  async delete(key: string): Promise<void> {
    store.delete(key)
  },
}
