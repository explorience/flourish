import { createClient } from '@/lib/supabase/server';
import { PostFeed } from '@/components/post-feed';
import { Header } from '@/components/header';
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from '@/lib/constants';

export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();
  
  const { data: posts } = await supabase
    .from('posts')
    .select('*, responses(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Header />

      {/* Hero */}
      <section className="text-center px-5 pt-12 pb-8">
        <h1
          className="text-5xl sm:text-6xl font-extrabold uppercase tracking-wide leading-none mb-2"
          style={{ color: 'var(--heading)', fontFamily: 'var(--font-display)' }}
        >
          {APP_NAME}
        </h1>
        <p
          className="text-sm italic mb-6"
          style={{ color: 'var(--sub)', fontFamily: 'var(--font-serif)' }}
        >
          {APP_DESCRIPTION}
        </p>
        {count !== null && count > 0 && (
          <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            {count} active {count === 1 ? 'post' : 'posts'} from your neighbours
          </p>
        )}
      </section>

      {/* Feed */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pb-24">
        <PostFeed initialPosts={posts || []} />
      </section>
    </main>
  );
}
