import { AuthForm } from './auth-form';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // If already logged in, go where they wanted (default: home, not account)
    const next = params.next || '/';
    redirect(next);
  }

  return (
    <main className="min-h-screen flex flex-col bg-page">
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(26,42,32,0.9)', borderColor: 'var(--border)' }}>
        <div className="max-w-xl mx-auto px-5 flex items-center" style={{ height: "156px" }}>
          <Link href="/" className="inline-flex items-center gap-2 text-xs color-sub">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold uppercase tracking-wide mb-2 font-display color-heading">
              Flourish
            </h1>
            <p className="text-sm italic font-serif color-sub">
              Sign in to post or respond
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
