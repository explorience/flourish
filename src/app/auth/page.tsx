import { AuthForm } from './auth-form';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AuthPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/account');

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(26,42,32,0.9)', borderColor: 'var(--border)' }}>
        <div className="max-w-xl mx-auto px-5 h-13 flex items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs" style={{ color: 'var(--sub)' }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold uppercase tracking-wide mb-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--heading)' }}>
              The Porch
            </h1>
            <p className="text-sm italic" style={{ fontFamily: 'var(--font-serif)', color: 'var(--sub)' }}>
              Sign in to manage your posts
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
