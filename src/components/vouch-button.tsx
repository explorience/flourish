'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Check } from 'lucide-react';

const ds = { fontFamily: 'var(--font-display)' };

export function VouchButton({ 
  voucheeId, 
  voucheeName,
  viewerVouchStatus 
}: { 
  voucheeId: string;
  voucheeName: string;
  viewerVouchStatus: string;
}) {
  const [context, setContext] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [vouching, setVouching] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Only vouched/voucher users can vouch
  if (viewerVouchStatus === 'unvouched') return null;

  const handleVouch = async () => {
    setVouching(true);
    setError('');

    try {
      const res = await fetch('/api/vouch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voucheeId, context: context.trim() || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to vouch');
      } else {
        setDone(true);
        setTimeout(() => router.refresh(), 1500);
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setVouching(false);
    }
  };

  if (done) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider"
        style={{ ...ds, background: 'rgba(58,106,74,0.15)', color: 'var(--offer)' }}>
        <Check className="w-4 h-4" /> Vouched for {voucheeName}
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-3">
        <p className="text-xs" style={{ color: 'var(--sub)', fontFamily: 'var(--font-serif)' }}>
          You&apos;re vouching that you know {voucheeName} and trust them in the community.
        </p>
        <input
          type="text"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="How do you know them? (optional)"
          maxLength={140}
          className="w-full px-4 py-3 text-sm"
          style={{ background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--border-card)', fontFamily: 'var(--font-serif)' }}
        />
        {error && <p className="text-xs" style={{ color: 'var(--need)' }}>{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={() => { setShowForm(false); setError(''); }}
            className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider"
            style={{ ...ds, color: 'var(--sub)', border: '1px solid var(--border)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleVouch}
            disabled={vouching}
            className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-40"
            style={{ ...ds, background: 'var(--offer)', color: 'var(--card)' }}
          >
            {vouching ? 'Vouching...' : 'Confirm vouch'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all"
      style={{ ...ds, background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--border-card)' }}
    >
      <Shield className="w-4 h-4" style={{ color: 'var(--offer)' }} />
      Vouch for {voucheeName}
    </button>
  );
}
