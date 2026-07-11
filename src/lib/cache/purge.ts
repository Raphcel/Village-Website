import { SITE_URL } from '@lib/site';

const SITE_ORIGIN = SITE_URL;

export async function purgeCache(paths: string[]): Promise<void> {
  try {
    const cache = (caches as any).default as Cache | undefined;
    if (!cache) return;
    await Promise.all(
      paths.map(p => cache.delete(new Request(`${SITE_ORIGIN}${p}`)))
    );
  } catch {
    // Cache API not available in local dev, safe to ignore
  }
}
