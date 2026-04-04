'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Check, Loader2 } from 'lucide-react';

const ds = { fontFamily: 'var(--font-display)' };
const sr = { fontFamily: 'var(--font-serif)' };

export function JoinForm({ inviteCode }: { inviteCode: string }) {
  const [code, setCode] = useState(inviteCode);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [autoRedeemed, setAutoRedeemed] = useState(false);
  const router = useRouter();

  // Auto-redeem if invite code is in URL
  useEffect(() => {
    if (inviteCode && !autoRedeemed) {
      setAutoRedeemed(true);
      handleRedeem(inviteCode);
    }
  }, [inviteCode]);

  async function handleRedeem(redeemCode: string) {
    if (!redeemCode.trim()) return;
    setRedeeming(true);
    setError('');

    try {
      const res = await fetch('/api/vouch/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: redeemCode.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to redeem invite');
      } else {
        setSuccess(true);
        setTimeout(() => router.push('/'), 2000);
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setRedeeming(false);
    }
  }

  if (success) {
    return (
      <div className="py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4" style={{ background: 'rgba(58,106,74,0.15)' }}>
          <Check className="w-8 h-8" style={{ color: 'var(--offer)' }} />
        </div>
        <h2 className="text-xl font-bold uppercase tracking-wide mb-2"
          style={{ ...ds, color: 'var(--heading)' }}>
          Welcome!
        </h2>
        <p className="text-sm" style={{ ...sr, color: 'var(--sub)' }}>
          You&apos;re now a trusted member. Redirecting to the board...
        </p>
      </div>
    );
  }

  if (redeeming && inviteCode) {
    return (
      <div className="py-8">
        <Loader2 className="w-8 h-8 mx-auto animate-spin mb-4" style={{ color: 'var(--offer)' }} />
        <p className="text-sm" style={{ ...sr, color: 'var(--sub)' }}>Joining the community...</p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleRedeem(code); }} className="max-w-sm mx-auto space-y-4">
      <div className="inline-flex items-center justify-center w-12 h-12 mb-2" style={{ background: 'rgba(58,106,74,0.15)' }}>
        <Shield className="w-6 h-6" style={{ color: 'var(--offer)' }} />
      </div>

      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter invite code"
        className="w-full px-4 py-3 text-sm text-center"
        style={{ background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--border-card)', ...sr }}
        autoFocus
      />

      {error && <p className="text-xs" style={{ color: 'var(--need)' }}>{error}</p>}

      <button
        type="submit"
        disabled={redeeming || !code.trim()}
        className="w-full px-6 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-40"
        style={{ ...ds, background: 'var(--offer)', color: 'var(--card)' }}
      >
        {redeeming ? 'Joining...' : 'Join the community'}
      </button>
    </form>
  );
}
