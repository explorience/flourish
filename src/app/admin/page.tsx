import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getModeratorByEmail, isAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { AdminDashboard } from './admin-dashboard';

export const revalidate = 0;

export default async function AdminPage() {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect('/auth?next=/admin');
  }

  const moderator = await getModeratorByEmail(user.email);

  if (!moderator) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] px-5">
          <div
            className="w-full max-w-sm p-8 text-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div
              className="text-2xl font-extrabold uppercase tracking-wide mb-3"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--need)' }}
            >
              Access Denied
            </div>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-light)', fontStyle: 'italic' }}
            >
              You do not have permission to access this area.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 text-xs font-bold uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-display)', background: 'var(--ink)', color: 'var(--card)' }}
            >
              Back to board
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Fetch data for dashboard using service client
  const serviceSupabase = await createServiceClient();

  // Stats
  const [
    { count: totalPosts },
    { count: activePosts },
    { count: pendingPosts },
    { count: rejectedPosts },
  ] = await Promise.all([
    serviceSupabase.from('posts').select('*', { count: 'exact', head: true }),
    serviceSupabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    serviceSupabase.from('posts').select('*', { count: 'exact', head: true }).eq('moderation_status', 'pending'),
    serviceSupabase.from('posts').select('*', { count: 'exact', head: true }).eq('moderation_status', 'rejected'),
  ]);

  // Recent posts pending moderation (pending or null moderation_status that are active)
  const { data: pendingPostsList } = await serviceSupabase
    .from('posts')
    .select('id, title, type, category, contact_name, created_at, moderation_status, status')
    .eq('status', 'active')
    .or('moderation_status.eq.pending,moderation_status.is.null')
    .order('created_at', { ascending: false })
    .limit(30);

  // All moderators (admin only)
  const userIsAdmin = moderator.role === 'admin';
  let moderators: any[] = [];
  if (userIsAdmin) {
    const { data } = await serviceSupabase
      .from('moderators')
      .select('*')
      .order('created_at', { ascending: true });
    moderators = data || [];
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Header />

      <div className="max-w-5xl mx-auto px-5 py-10">

        {/* Page header */}
        <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--sub)' }}
            >
              {moderator.role === 'admin' ? 'Admin' : 'Moderator'}
            </p>
            <h1
              className="text-4xl font-extrabold uppercase tracking-wide leading-none"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--heading)' }}
            >
              Dashboard
            </h1>
          </div>
          <p
            className="text-xs"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)', letterSpacing: '0.05em' }}
          >
            Signed in as {user.email}
          </p>
        </div>

        {/* Pass everything to client component for interactivity */}
        <AdminDashboard
          stats={{
            total: totalPosts || 0,
            active: activePosts || 0,
            pending: pendingPosts || 0,
            rejected: rejectedPosts || 0,
          }}
          pendingPosts={pendingPostsList || []}
          moderators={moderators}
          isAdmin={userIsAdmin}
          currentUserEmail={user.email}
        />
      </div>
    </main>
  );
}
