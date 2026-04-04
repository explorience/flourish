import { createClient } from '@/lib/supabase/server';

/**
 * Check if vouching is required for posting/responding.
 * When false, all authenticated users can post freely.
 */
export async function isVouchRequired(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'require_vouch')
      .single();

    return data?.value === true;
  } catch {
    // If settings table doesn't exist yet, default to no requirement
    return false;
  }
}
