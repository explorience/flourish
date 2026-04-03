import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileForm } from './profile-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(26,42,32,0.9)', borderColor: 'var(--border)' }}>
        <div className="max-w-xl mx-auto px-5 flex items-center justify-between" style={{ height: '3.25rem' }}>
          <Link href="/account" className="inline-flex items-center gap-2 text-xs" style={{ color: 'var(--sub)' }}>
            <ArrowLeft className="w-4 h-4" /> Account
          </Link>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-5 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold uppercase tracking-wide mb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--heading)' }}>
            Your profile
          </h1>
          <p className="text-sm italic" style={{ fontFamily: 'var(--font-serif)', color: 'var(--sub)' }}>
            How you appear to the community
          </p>
        </div>

        <ProfileForm
          userId={user.id}
          initialName={profile?.display_name || user.email?.split('@')[0] || ''}
          initialNeighbourhood={profile?.neighbourhood || ''}
          initialBio={profile?.bio || ''}
        />
      </div>
    </main>
  );
}
