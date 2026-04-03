import { createClient } from '@/lib/supabase/client';

let cachedVouchRequired: boolean | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute

/**
 * Client-side check: is vouching required?
 * Cached for 1 minute to avoid hammering Supabase.
 */
export async function isVouchRequiredClient(): Promise<boolean> {
  const now = Date.now();
  if (cachedVouchRequired !== null && now - cacheTime < CACHE_TTL) {
    return cachedVouchRequired;
  }

  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'require_vouch')
      .single();

    cachedVouchRequired = data?.value === true;
    cacheTime = now;
    return cachedVouchRequired;
  } catch {
    return false;
  }
}
