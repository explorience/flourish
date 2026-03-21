'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type Mode = 'sign_in' | 'sign_up' | 'magic';

export function AuthForm() {
  const [mode, setMode] = useState<Mode>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const ds = { fontFamily: 'var(--font-display)' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const supabase = createClient();

    if (mode === 'magic') {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
      else setMessage('Check your email for a magic link!');
    } else if (mode === 'sign_up') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { display_name: displayName || email.split('@')[0] },
        },
      });
      if (error) setError(error.message);
      else setMessage('Check your email to confirm your account.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push('/account');
    }
    setLoading(false);
  };

  const inputStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border-card)',
    color: 'var(--ink)',
    padding: '12px 16px',
    width: '100%',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.6rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    color: 'var(--sub)',
    marginBottom: '6px',
    ...ds,
  };

  return (
    <div>
      {/* Mode tabs */}
      <div className="flex gap-0 mb-8" style={{ border: '1.5px solid var(--border)' }}>
        {[
          { val: 'magic' as Mode, label: 'Magic Link' },
          { val: 'sign_in' as Mode, label: 'Password' },
          { val: 'sign_up' as Mode, label: 'Sign Up' },
        ].map((m) => (
          <button key={m.val} onClick={() => setMode(m.val)}
            className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all"
            style={{
              ...ds,
              background: mode === m.val ? 'var(--card)' : 'transparent',
              color: mode === m.val ? 'var(--ink)' : 'var(--sub)',
              borderRight: m.val !== 'sign_up' ? '1px solid var(--border)' : 'none',
              fontSize: '0.6rem',
            }}
          >{m.label}</button>
        ))}
      </div>

      {message ? (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: 'var(--heading)' }}>{message}</p>
          <button onClick={() => setMessage('')} className="mt-4 text-xs underline" style={{ color: 'var(--sub)' }}>Back</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'sign_up' && (
            <div>
              <label style={labelStyle}>Your name</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={inputStyle} placeholder="First name" />
            </div>
          )}
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="you@example.com" required autoFocus />
          </div>
          {(mode === 'sign_in' || mode === 'sign_up') && (
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} placeholder="••••••••" required minLength={6} />
            </div>
          )}

          {error && <p className="text-xs px-3 py-2" style={{ background: 'rgba(208,112,64,0.1)', color: 'var(--need)', border: '1px solid rgba(208,112,64,0.2)' }}>{error}</p>}

          <button type="submit" disabled={loading || !email}
            className="w-full py-3.5 text-sm font-bold uppercase tracking-wider disabled:opacity-40 transition-all mt-2"
            style={{ background: 'var(--card)', color: 'var(--ink)', ...ds }}
          >
            {loading ? 'Working...' : mode === 'magic' ? 'Send magic link' : mode === 'sign_up' ? 'Create account' : 'Sign in'}
          </button>
        </form>
      )}

      <p className="text-center text-xs mt-6" style={{ color: 'var(--sub)' }}>
        You don&apos;t need an account to post or respond. Accounts let you edit and close your own posts.
      </p>
    </div>
  );
}
