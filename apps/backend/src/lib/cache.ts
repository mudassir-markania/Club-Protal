interface CacheItem<T> {
  data: T;
  expires: number;
}

const cacheStore = new Map<string, CacheItem<any>>();

export function getCached<T = any>(key: string): T | null {
  const item = cacheStore.get(key);
  if (!item) return null;
  if (Date.now() > item.expires) {
    cacheStore.delete(key);
    return null;
  }
  return item.data as T;
}

export function setCached<T = any>(key: string, data: T, ttlSeconds: number = 30): void {
  cacheStore.set(key, {
    data,
    expires: Date.now() + ttlSeconds * 1000,
  });
}

export function clearCache(prefix?: string): void {
  if (!prefix) {
    cacheStore.clear();
    return;
  }
  for (const k of cacheStore.keys()) {
    if (k.startsWith(prefix)) {
      cacheStore.delete(k);
    }
  }
}
