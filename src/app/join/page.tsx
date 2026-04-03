import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Header } from '@/components/header';
import { VouchGate } from '@/components/vouch-gate';
import { APP_NAME } from '@/lib/constants';

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, redirect to auth with invite code preserved
  if (!user) {
    const next = params.invite ? `/join?invite=${params.invite}` : '/join';
    redirect(`/auth?next=${encodeURIComponent(next)}`);
  }

  // Check current vouch status
  const { data: profile } = await supabase
    .from('profiles')
    .select('vouch_status')
    .eq('id', user.id)
    .single();

  // If already vouched, just go home
  if (profile && profile.vouch_status !== 'unvouched') {
    redirect('/');
  }

  // If invite code provided, try auto-redeem via client
  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Header />
      <div className="max-w-xl mx-auto px-5 py-12 text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-wide mb-4"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--heading)' }}>
          Join {APP_NAME}
        </h1>
        <p className="text-base mb-8" style={{ fontFamily: 'var(--font-serif)', color: 'var(--sub)' }}>
          You&apos;ve been invited to join the community exchange.
        </p>
        <JoinClient inviteCode={params.invite || ''} />
      </div>
    </main>
  );
}

function JoinClient({ inviteCode }: { inviteCode: string }) {
  // This needs to be a client component for the redeem flow
  return <JoinForm inviteCode={inviteCode} />;
}

import { JoinForm } from './join-form';
