import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * True if either user has blocked the other (table from migration 020).
 * Fails open if the table doesn't exist yet so messaging keeps working
 * before the migration is applied.
 */
export async function isBlockedEitherWay(
  admin: SupabaseClient,
  a: string,
  b: string
): Promise<boolean> {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(a) || !uuid.test(b)) return true; // never interpolate untrusted strings into .or()
  const { data, error } = await admin
    .from('user_blocks')
    .select('blocker_id')
    .or(`and(blocker_id.eq.${a},blocked_id.eq.${b}),and(blocker_id.eq.${b},blocked_id.eq.${a})`)
    .limit(1);
  if (error) return false;
  return (data?.length || 0) > 0;
}
