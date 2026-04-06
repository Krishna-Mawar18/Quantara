import { useCacheStore, cacheKeys, cacheTTL } from "@/store/cache";
import type { Dataset, AnalyticsResult } from "@/types";
import * as api from "@/lib/api";

export interface CachedFetchOptions {
  skipCache?: boolean;
  ttl?: number;
}

export async function cachedFetchDatasets(options: CachedFetchOptions = {}): Promise<Dataset[]> {
  const { get, set } = useCacheStore.getState();
  const { skipCache = false, ttl = cacheTTL.long } = options;

  if (!skipCache) {
    const cached = get<Dataset[]>(cacheKeys.datasets);
    if (cached?.data) {
      return cached.data;
    }
  }

  const data = await api.fetchDatasets();
  const datasets: Dataset[] = data.map((d) => ({
    ...d,
    status: d.status as Dataset["status"],
  }));
  set(cacheKeys.datasets, datasets, ttl);
  return datasets;
}

export async function cachedFetchDataset(id: string, options: CachedFetchOptions = {}): Promise<Dataset> {
  const { get, set } = useCacheStore.getState();
  const { skipCache = false, ttl = cacheTTL.long } = options;
  const key = cacheKeys.dataset(id);

  if (!skipCache) {
    const cached = get<Dataset>(key);
    if (cached?.data) {
      return cached.data;
    }
  }

  const data = await api.fetchDataset(id);
  const dataset: Dataset = {
    ...data,
    status: data.status as Dataset["status"],
  };
  set(key, dataset, ttl);
  return dataset;
}

export async function cachedGetAnalytics(fileId: string, options: CachedFetchOptions = {}): Promise<AnalyticsResult> {
  const { get, set } = useCacheStore.getState();
  const { skipCache = false, ttl = cacheTTL.medium } = options;
  const key = cacheKeys.analytics(fileId);

  if (!skipCache) {
    const cached = get<AnalyticsResult>(key);
    if (cached?.data) {
      return cached.data;
    }
  }

  const data = await api.getAnalytics(fileId);
  set(key, data, ttl);
  return data;
}

export async function cachedGetPlanInfo(options: CachedFetchOptions = {}): Promise<{
  plan: string;
  limits: { datasets: number; rows_per_dataset: number; predictions_per_month: number };
  features: string[];
  usage: { datasets: number };
}> {
  const { get, set } = useCacheStore.getState();
  const { skipCache = false, ttl = cacheTTL.short } = options;

  if (!skipCache) {
    const cached = get<{
      plan: string;
      limits: { datasets: number; rows_per_dataset: number; predictions_per_month: number };
      features: string[];
      usage: { datasets: number };
    }>(cacheKeys.planInfo);
    if (cached?.data) {
      return cached.data;
    }
  }

  const data = await api.getPlanInfo();
  set(cacheKeys.planInfo, data, ttl);
  return data;
}

export function invalidateAllDatasetCache() {
  const { invalidate, invalidatePattern } = useCacheStore.getState();
  invalidate(cacheKeys.datasets);
  invalidatePattern("dataset:");
  invalidatePattern("analytics:");
  invalidatePattern("playground:");
}

export function invalidateAnalyticsCache(datasetId: string) {
  const { invalidate } = useCacheStore.getState();
  invalidate(cacheKeys.analytics(datasetId));
}

export function invalidatePlanCache() {
  const { invalidate } = useCacheStore.getState();
  invalidate(cacheKeys.planInfo);
  invalidate(cacheKeys.plans);
  invalidate(cacheKeys.subscription);
}
