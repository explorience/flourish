import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AccountClient } from './account-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: posts } = await supabase
    .from('posts')
    .select('*, responses(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(26,42,32,0.9)', borderColor: 'var(--border)' }}>
        <div className="max-w-xl mx-auto px-5 h-13 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs" style={{ color: 'var(--sub)' }}>
            <ArrowLeft className="w-4 h-4" /> Flourish
          </Link>
          <span className="text-xs" style={{ color: 'var(--sub)', fontFamily: 'var(--font-display)' }}>
            {user.email}
          </span>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-5 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold uppercase tracking-wide mb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--heading)' }}>
            Your posts
          </h1>
          <p className="text-sm italic" style={{ fontFamily: 'var(--font-serif)', color: 'var(--sub)' }}>
            {posts?.length || 0} {posts?.length === 1 ? 'post' : 'posts'} from you
          </p>
        </div>

        <AccountClient user={user} posts={posts || []} />
      </div>
    </main>
  );
}
