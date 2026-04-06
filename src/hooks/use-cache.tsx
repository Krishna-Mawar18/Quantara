"use client";

import React, { createContext, useContext, useEffect, useCallback, useRef } from "react";
import { useCacheStore, cacheKeys, cacheTTL } from "@/store/cache";
import { useAuthStore } from "@/store/auth";

interface CacheContextValue {
  getCached: <T>(key: string) => T | null;
  setCached: <T>(key: string, data: T, ttl?: number) => void;
  invalidate: (key: string) => void;
  invalidatePattern: (pattern: string) => void;
  clearCache: () => void;
  getStats: () => { hits: number; misses: number; size: number };
  prefetch: <T>(key: string, fetcher: () => Promise<T>, ttl?: number) => Promise<void>;
}

const CacheContext = createContext<CacheContextValue | null>(null);

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const store = useCacheStore();
  const userId = useAuthStore((s) => s.user?.uid);
  const cleanupRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    store.cleanup();
    
    cleanupRef.current = setInterval(() => {
      store.cleanup();
    }, 60000);

    return () => {
      if (cleanupRef.current) {
        clearInterval(cleanupRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      store.clear();
    }
  }, [userId]);

  const getCached = useCallback(<T,>(key: string): T | null => {
    const entry = store.get<T>(key);
    return entry?.data ?? null;
  }, [store]);

  const setCached = useCallback(<T,>(key: string, data: T, ttl?: number) => {
    store.set(key, data, ttl);
  }, [store]);

  const invalidate = useCallback((key: string) => {
    store.invalidate(key);
  }, [store]);

  const invalidatePattern = useCallback((pattern: string) => {
    store.invalidatePattern(pattern);
  }, [store]);

  const clearCache = useCallback(() => {
    store.clear();
  }, [store]);

  const getStats = useCallback(() => {
    return store.getStats();
  }, [store]);

  const prefetch = useCallback(async <T,>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = cacheTTL.medium
  ) => {
    if (!store.has(key)) {
      try {
        const data = await fetcher();
        store.set(key, data, ttl);
      } catch {
      }
    }
  }, [store]);

  return (
    <CacheContext.Provider
      value={{
        getCached,
        setCached,
        invalidate,
        invalidatePattern,
        clearCache,
        getStats,
        prefetch,
      }}
    >
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error("useCache must be used within CacheProvider");
  }
  return context;
}

export function useCachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { getCached, setCached, invalidate } = useCache();
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const { ttl = cacheTTL.medium, enabled = true, onSuccess, onError } = options;

  const fetchData = React.useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const cached = getCached<T>(key);
      if (cached !== null) {
        setData(cached);
        setIsLoading(false);
        onSuccess?.(cached);
        return;
      }

      const freshData = await fetcher();
      setCached(key, freshData, ttl);
      setData(freshData);
      onSuccess?.(freshData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, getCached, setCached, ttl, enabled, onSuccess, onError]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = React.useCallback(async () => {
    invalidate(key);
    await fetchData();
  }, [key, invalidate, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidate: () => invalidate(key),
  };
}

export function useDatasetCache() {
  const { getCached, setCached, invalidate, invalidatePattern, prefetch } = useCache();
  
  const getDatasets = React.useCallback(() => {
    return getCached<unknown[]>(cacheKeys.datasets);
  }, [getCached]);

  const setDatasets = React.useCallback((datasets: unknown[]) => {
    setCached(cacheKeys.datasets, datasets, cacheTTL.long);
  }, [setCached]);

  const getDataset = React.useCallback((id: string) => {
    return getCached<unknown>(cacheKeys.dataset(id));
  }, [getCached]);

  const setDataset = React.useCallback((id: string, dataset: unknown) => {
    setCached(cacheKeys.dataset(id), dataset, cacheTTL.long);
  }, [setCached]);

  const invalidateDatasets = React.useCallback(() => {
    invalidate(cacheKeys.datasets);
    invalidatePattern("dataset:");
  }, [invalidate, invalidatePattern]);

  const prefetchDatasets = React.useCallback(async (fetcher: () => Promise<unknown[]>) => {
    await prefetch(cacheKeys.datasets, fetcher, cacheTTL.long);
  }, [prefetch]);

  return {
    getDatasets,
    setDatasets,
    getDataset,
    setDataset,
    invalidateDatasets,
    prefetchDatasets,
  };
}

export function useAnalyticsCache() {
  const { getCached, setCached, invalidate } = useCache();

  const getAnalytics = React.useCallback((datasetId: string) => {
    return getCached<unknown>(cacheKeys.analytics(datasetId));
  }, [getCached]);

  const setAnalytics = React.useCallback((datasetId: string, analytics: unknown) => {
    setCached(cacheKeys.analytics(datasetId), analytics, cacheTTL.medium);
  }, [setCached]);

  const invalidateAnalytics = React.useCallback((datasetId: string) => {
    invalidate(cacheKeys.analytics(datasetId));
  }, [invalidate]);

  return {
    getAnalytics,
    setAnalytics,
    invalidateAnalytics,
  };
}

export function usePlanCache() {
  const { getCached, setCached, invalidate } = useCache();

  const getPlanInfo = React.useCallback(() => {
    return getCached<unknown>(cacheKeys.planInfo);
  }, [getCached]);

  const setPlanInfo = React.useCallback((info: unknown) => {
    setCached(cacheKeys.planInfo, info, cacheTTL.short);
  }, [setCached]);

  const invalidatePlanInfo = React.useCallback(() => {
    invalidate(cacheKeys.planInfo);
  }, [invalidate]);

  return {
    getPlanInfo,
    setPlanInfo,
    invalidatePlanInfo,
  };
}

export { cacheKeys, cacheTTL };
