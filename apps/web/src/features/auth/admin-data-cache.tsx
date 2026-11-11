import { createContext, useContext, useState, type ReactNode } from "react"

type CacheEntry = { value: unknown; savedAt: number }

type AdminDataCache = {
  get: <Value>(key: string) => Value | undefined
  set: <Value>(key: string, value: Value) => void
  invalidate: (prefix: string) => void
}

const cacheLifetimeMs = 60_000
const AdminDataCacheContext = createContext<AdminDataCache | null>(null)

export function AdminDataCacheProvider({ children }: { children: ReactNode }) {
  const [cache] = useState<AdminDataCache>(() => {
    const entries = new Map<string, CacheEntry>()
    return {
      get: <Value,>(key: string) => {
        const entry = entries.get(key)
        if (!entry) return undefined
        if (Date.now() - entry.savedAt >= cacheLifetimeMs) {
          entries.delete(key)
          return undefined
        }
        return entry.value as Value
      },
      set: (key, value) => {
        entries.set(key, { value, savedAt: Date.now() })
      },
      invalidate: (prefix) => {
        for (const key of entries.keys()) {
          if (key.startsWith(prefix)) entries.delete(key)
        }
      },
    }
  })

  return (
    <AdminDataCacheContext.Provider value={cache}>
      {children}
    </AdminDataCacheContext.Provider>
  )
}

export function useAdminDataCache() {
  return useContext(AdminDataCacheContext)
}
