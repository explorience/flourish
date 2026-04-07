import { createClient } from '@/lib/supabase/server';
import { PostFeed } from '@/components/post-feed';
import { Header } from '@/components/header';
import { PostSomethingButton } from '@/components/post-something-button';
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from '@/lib/constants';
import { getModeratorByEmail } from '@/lib/admin';

export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();

  // Check if current user is a moderator (for moderation UI in feed)
  const { data: { user } } = await supabase.auth.getUser();
  const isModerator = user?.email ? !!(await getModeratorByEmail(user.email)) : false;
  
  const { data: posts } = await supabase
    .from('posts')
    .select('*, responses(*)')
    .eq('status', 'active')
    // Show approved posts, or posts without a moderation_status (legacy/unmoderated)
    .or('moderation_status.eq.approved,moderation_status.is.null')
    .order('created_at', { ascending: false });

  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .or('moderation_status.eq.approved,moderation_status.is.null');

  return (
    <main id="main-content" className="min-h-screen bg-page">
      <Header />

      {/* Hero */}
      <section className="text-center px-5 pt-4 pb-8">
        <h1 className="sr-only">{APP_NAME} — {APP_DESCRIPTION}</h1>
        <p
          className="text-5xl sm:text-6xl font-extrabold uppercase tracking-wide leading-none mb-2 font-display color-heading"
          aria-hidden="true"
        >
          {APP_NAME}
        </p>
        <p
          className="text-base sm:text-xl mb-4 font-serif color-sub"
        >
          {APP_DESCRIPTION}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-0">
          <button
            onClick={() => window.location.href = '/auth?next=/post'}
            className="post-btn px-8 py-3 text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 hover:brightness-110"
            style={{ background: 'var(--offer)', color: 'var(--card)' }}
          >
            Offer what you have
          </button>
          <a href="/map" className="px-8 py-3 text-sm font-bold uppercase tracking-wider transition-colors font-display color-heading"
            style={{ border: '1.5px solid rgba(232,224,204,0.2)' }}>
            View map
          </a>
        </div>
        <div className="flex items-center justify-center gap-3 mt-0.5">
          <a href="/map" className="px-8 py-3 text-sm font-bold uppercase tracking-wider transition-colors font-display color-heading"
            style={{ border: '1.5px solid var(--border)', fontSize: '0.78rem' }}>
            See map
          </a>
        </div>
      </section>

      {/* Feed */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pb-24 flex flex-col items-center">
        <div className="w-full">
          <PostFeed initialPosts={posts || []} isModerator={isModerator} />
        </div>
      </section>
    </main>
  );
}
