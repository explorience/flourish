import { createServiceClient } from '@/lib/supabase/server';

export interface Moderator {
  id: string;
  email: string;
  role: 'admin' | 'mod';
  name: string | null;
  created_at: string;
  created_by: string | null;
}

/**
 * Check whether an email address belongs to a moderator.
 * Uses the service role client so RLS doesn't block the lookup.
 */
export async function getModeratorByEmail(email: string): Promise<Moderator | null> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('moderators')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error || !data) return null;
  return data as Moderator;
}

/**
 * Returns true if the given email belongs to any moderator (mod or admin).
 */
export async function isModerator(email: string): Promise<boolean> {
  const mod = await getModeratorByEmail(email);
  return mod !== null;
}

/**
 * Returns true only if the given email belongs to an admin-role moderator.
 */
export async function isAdmin(email: string): Promise<boolean> {
  const mod = await getModeratorByEmail(email);
  return mod?.role === 'admin';
}
