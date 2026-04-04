'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

const ds = { fontFamily: 'var(--font-display)' };
const sr = { fontFamily: 'var(--font-serif)' };

export function VouchGate({ vouchStatus }: { vouchStatus: string }) {
  const [code, setCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  if (vouchStatus !== 'unvouched') return null;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setRedeeming(true);
    setError('');

    try {
      const res = await fetch('/api/vouch/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to redeem invite');
      } else {
        setSuccess(true);
        setTimeout(() => router.refresh(), 1500);
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="px-5 py-8 text-center" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-md mx-auto">
        <div className="inline-flex items-center justify-center w-12 h-12 mb-4" style={{ background: 'rgba(58,106,74,0.15)' }}>
          <Shield className="w-6 h-6" style={{ color: 'var(--offer)' }} />
        </div>

        <h2 className="text-lg font-bold uppercase tracking-wide mb-2"
          style={{ ...ds, color: 'var(--heading)' }}>
          Trust-based community
        </h2>

        <p className="text-sm mb-4" style={{ ...sr, color: 'var(--sub)' }}>
          To post or respond, you need a vouch from an existing member.
          Ask someone in the community, or use an invite link.
        </p>

        {success ? (
          <div className="px-4 py-3 text-sm font-bold uppercase tracking-wider"
            style={{ ...ds, background: 'rgba(58,106,74,0.15)', color: 'var(--offer)' }}>
            Welcome to the community!
          </div>
        ) : showCodeInput ? (
          <form onSubmit={handleRedeem} className="space-y-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste invite code"
              className="w-full px-4 py-3 text-sm text-center"
              style={{ background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--border-card)', fontFamily: 'var(--font-serif)' }}
              autoFocus
            />
            {error && <p className="text-xs" style={{ color: 'var(--need)' }}>{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowCodeInput(false); setError(''); }}
                className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider"
                style={{ ...ds, background: 'transparent', color: 'var(--sub)', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={redeeming || !code.trim()}
                className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                style={{ ...ds, background: 'var(--offer)', color: 'var(--card)' }}
              >
                {redeeming ? 'Joining...' : 'Join'}
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowCodeInput(true)}
            className="px-6 py-3 text-xs font-bold uppercase tracking-wider"
            style={{ ...ds, background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--border-card)' }}
          >
            I have an invite code
          </button>
        )}
      </div>
    </div>
  );
}
