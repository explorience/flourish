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
    <main className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(35,40%,92%)] via-[hsl(39,50%,96%)] to-transparent" />
        <div className="relative max-w-2xl mx-auto px-5 pt-12 pb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[hsl(25,30%,18%)] leading-[1.1] mb-4">
            {APP_NAME}
          </h1>
          <p className="text-sm uppercase tracking-[0.2em] text-[hsl(25,15%,55%)] font-medium mb-5">
            {APP_TAGLINE}
          </p>
          <p className="text-lg text-[hsl(25,20%,40%)] leading-relaxed max-w-md mx-auto mb-8" style={{ fontFamily: 'var(--font-display)' }}>
            {APP_DESCRIPTION}
          </p>
          
          {count !== null && count > 0 && (
            <p className="text-sm text-[hsl(25,15%,55%)]">
              {count} active {count === 1 ? 'post' : 'posts'} from your neighbours
            </p>
          )}
        </div>
      </section>

      {/* Feed */}
      <section className="max-w-2xl mx-auto px-5 pb-24">
        <PostFeed initialPosts={posts || []} />
      </section>
    </main>
  );
}
