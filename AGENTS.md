<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Caching System

This project uses a Redis-like in-memory caching system to reduce API calls and improve performance.

### Key Files
- `src/store/cache.ts` - Zustand store with TTL-based caching and localStorage persistence
- `src/hooks/use-cache.tsx` - React context and hooks for cache management
- `src/lib/cached-api.ts` - Cached versions of API functions

### Usage

```typescript
// Use cached API functions
import { cachedFetchDatasets, cachedGetAnalytics } from "@/lib/cached-api";

// Fetch with automatic caching
const datasets = await cachedFetchDatasets();
const analytics = await cachedGetAnalytics(datasetId);

// Invalidate cache when data changes
import { invalidateAllDatasetCache } from "@/lib/cached-api";
invalidateAllDatasetCache();

// Use hooks for components
import { useCachedQuery, useDatasetCache, usePlanCache } from "@/hooks/use-cache";

// Use cache keys for manual operations
import { cacheKeys, cacheTTL } from "@/store/cache";
useCacheStore.getState().set(key, data, cacheTTL.long);
```

### TTL Values
- `cacheTTL.short` - 1 minute
- `cacheTTL.medium` - 5 minutes
- `cacheTTL.long` - 30 minutes
- `cacheTTL.persistent` - No expiration

### Cache Keys
- `cacheKeys.datasets` - All datasets list
- `cacheKeys.dataset(id)` - Individual dataset
- `cacheKeys.analytics(id)` - Analytics for dataset
- `cacheKeys.planInfo` - User plan info

