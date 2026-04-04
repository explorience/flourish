'use client';

import { useState, useEffect } from 'react';
import { Link2, Copy, Check } from 'lucide-react';

const ds = { fontFamily: 'var(--font-display)' };

export function InviteSection({ vouchStatus }: { vouchStatus: string }) {
  const [creating, setCreating] = useState(false);
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [invites, setInvites] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/vouch/invite')
      .then(r => r.json())
      .then(data => { if (data.invites) setInvites(data.invites); })
      .catch(() => {});
  }, [link]);

  if (vouchStatus === 'unvouched') return null;

  const createInvite = async () => {
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/vouch/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create invite');
      } else {
        setLink(data.link);
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setCreating(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeInvites = invites.filter(i => 
    new Date(i.expires_at) > new Date() && i.used_count < i.max_uses
  );

  return (
    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
      <h3 className="text-xs font-bold uppercase tracking-wider mb-3"
        style={{ ...ds, color: 'var(--sub)', fontSize: '0.6rem' }}>
        Invite someone
      </h3>

      {link ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={link}
              readOnly
              className="flex-1 px-3 py-2 text-xs"
              style={{ background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--border-card)', fontFamily: 'var(--font-serif)' }}
            />
            <button
              onClick={copyLink}
              className="px-3 py-2"
              style={{ background: 'var(--card)', border: '1px solid var(--border-card)' }}
            >
              {copied ? <Check className="w-4 h-4" style={{ color: 'var(--offer)' }} /> : <Copy className="w-4 h-4" style={{ color: 'var(--ink)' }} />}
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--sub)' }}>
            Share this link with someone you trust. Expires in 7 days, up to 3 uses.
          </p>
          <button
            onClick={() => { setLink(''); }}
            className="text-xs underline"
            style={{ color: 'var(--sub)' }}
          >
            Create another
          </button>
        </div>
      ) : (
        <button
          onClick={createInvite}
          disabled={creating}
          className="inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all w-full disabled:opacity-40"
          style={{ ...ds, background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--border-card)' }}
        >
          <Link2 className="w-4 h-4" /> {creating ? 'Creating...' : 'Create invite link'}
        </button>
      )}

      {error && <p className="text-xs mt-2" style={{ color: 'var(--need)' }}>{error}</p>}

      {activeInvites.length > 0 && !link && (
        <div className="mt-3">
          <p className="text-xs" style={{ color: 'var(--sub)' }}>
            {activeInvites.length} active invite{activeInvites.length > 1 ? 's' : ''} ({activeInvites.reduce((s, i) => s + i.used_count, 0)} used)
          </p>
        </div>
      )}
    </div>
  );
}
