import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

interface CacheState {
  cache: Record<string, CacheEntry<unknown>>;
  stats: CacheStats;
  set: <T>(key: string, data: T, ttl?: number) => void;
  get: <T>(key: string) => CacheEntry<T> | null;
  has: (key: string) => boolean;
  invalidate: (key: string) => void;
  invalidatePattern: (pattern: string) => void;
  clear: () => void;
  getStats: () => CacheStats;
  cleanup: () => void;
}

const DEFAULT_TTL = 5 * 60 * 1000;

export const useCacheStore = create<CacheState>()(
  persist(
    (set, get) => ({
      cache: {},
      stats: { hits: 0, misses: 0, size: 0 },

      set: <T>(key: string, data: T, ttl: number = DEFAULT_TTL) => {
        set((state) => ({
          cache: {
            ...state.cache,
            [key]: {
              data,
              timestamp: Date.now(),
              ttl,
              key,
            },
          },
          stats: {
            ...state.stats,
            size: Object.keys(state.cache).length + 1,
          },
        }));
      },

      get: <T>(key: string): CacheEntry<T> | null => {
        const entry = get().cache[key];
        
        if (!entry) {
          set((state) => ({
            stats: { ...state.stats, misses: state.stats.misses + 1 },
          }));
          return null;
        }

        const now = Date.now();
        const age = now - entry.timestamp;

        if (age > entry.ttl) {
          get().invalidate(key);
          set((state) => ({
            stats: { ...state.stats, misses: state.stats.misses + 1 },
          }));
          return null;
        }

        set((state) => ({
          stats: { ...state.stats, hits: state.stats.hits + 1 },
        }));

        return entry as CacheEntry<T>;
      },

      has: (key: string) => {
        const entry = get().cache[key];
        if (!entry) return false;
        
        const age = Date.now() - entry.timestamp;
        if (age > entry.ttl) {
          get().invalidate(key);
          return false;
        }
        return true;
      },

      invalidate: (key: string) => {
        set((state) => {
          const { [key]: _, ...rest } = state.cache;
          void _;
          return {
            cache: rest,
            stats: { ...state.stats, size: Object.keys(rest).length },
          };
        });
      },

      invalidatePattern: (pattern: string) => {
        const regex = new RegExp(pattern);
        set((state) => {
          const newCache: Record<string, CacheEntry<unknown>> = {};
          
          for (const [key, entry] of Object.entries(state.cache)) {
            if (!regex.test(key)) {
              newCache[key] = entry;
            }
          }
          
          return {
            cache: newCache,
            stats: { ...state.stats, size: Object.keys(newCache).length },
          };
        });
      },

      clear: () => {
        set({
          cache: {},
          stats: { hits: 0, misses: 0, size: 0 },
        });
      },

      getStats: () => get().stats,

      cleanup: () => {
        const now = Date.now();
        set((state) => {
          const newCache: Record<string, CacheEntry<unknown>> = {};
          
          for (const [key, entry] of Object.entries(state.cache)) {
            const age = now - entry.timestamp;
            if (age <= entry.ttl) {
              newCache[key] = entry;
            }
          }
          
          return {
            cache: newCache,
            stats: { ...state.stats, size: Object.keys(newCache).length },
          };
        });
      },
    }),
    {
      name: "quantara-cache",
      partialize: (state) => ({
        cache: state.cache,
        stats: state.stats,
      }),
    }
  )
);

export const cacheKeys = {
  datasets: "datasets",
  dataset: (id: string) => `dataset:${id}`,
  analytics: (id: string) => `analytics:${id}`,
  prediction: (id: string) => `prediction:${id}`,
  planInfo: "plan:info",
  plans: "plans",
  subscription: "subscription",
  playground: {
    preview: (id: string) => `playground:preview:${id}`,
    columns: (id: string) => `playground:columns:${id}`,
    modelSchema: (id: string, target: string) => `playground:schema:${id}:${target}`,
  },
} as const;

export const cacheTTL = {
  short: 60 * 1000,
  medium: 5 * 60 * 1000,
  long: 30 * 60 * 1000,
  persistent: -1,
} as const;
