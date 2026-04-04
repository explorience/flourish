import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AccountClient } from './account-client';
import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { InviteSection } from '@/components/invite-section';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: posts } = await supabase
    .from('posts')
    .select('*, responses(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: profile } = await supabase
    .from('profiles')
    .select('vouch_status, vouch_count')
    .eq('id', user.id)
    .single();

  const vouchStatus = profile?.vouch_status || 'unvouched';
  const vouchCount = profile?.vouch_count || 0;

  return (
    <main className="min-h-screen bg-page">
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(26,42,32,0.9)', borderColor: 'var(--border)' }}>
        <div className="max-w-xl mx-auto px-5 flex items-center justify-between" style={{ height: '3.25rem' }}>
          <Link href="/" className="inline-flex items-center gap-2 text-xs color-sub">
            <ArrowLeft className="w-4 h-4" /> Flourish
          </Link>
          <span className="text-xs font-display color-sub">
            {user.email}
          </span>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-5 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold uppercase tracking-wide mb-1 font-display color-heading">
            Your posts
          </h1>
          <p className="text-sm italic font-serif color-sub">
            {posts?.length || 0} {posts?.length === 1 ? 'post' : 'posts'} from you
          </p>
        </div>

        {/* Vouch Status */}
        {vouchStatus === 'unvouched' && (
          <div className="mb-6 px-4 py-4" style={{ background: 'rgba(208,112,64,0.1)', border: '1px solid var(--need)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 color-need" />
              <span className="text-xs font-bold uppercase tracking-wider font-display color-need">
                Not yet vouched
              </span>
            </div>
            <p className="text-xs font-serif color-sub">
              You need a vouch from an existing member to post or respond. Ask someone in the community, or use an invite link.
            </p>
          </div>
        )}
        {vouchStatus !== 'unvouched' && (
          <div className="mb-6 px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(58,106,74,0.1)', border: '1px solid var(--offer)' }}>
            <Shield className="w-4 h-4 color-offer" />
            <span className="text-xs font-bold uppercase tracking-wider font-display color-offer">
              Trusted member {vouchCount > 0 ? `· ${vouchCount} vouch${vouchCount > 1 ? 'es' : ''}` : ''}
            </span>
          </div>
        )}

        <AccountClient user={user} posts={posts || []} />

        {/* Invite Section */}
        <InviteSection vouchStatus={vouchStatus} />
      </div>
    </main>
  );
}
