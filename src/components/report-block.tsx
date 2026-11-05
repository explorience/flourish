'use client';

import { useState } from 'react';
import { Flag, Ban } from 'lucide-react';

// Quiet, always-available safety actions for a post and its author.
export function ReportBlock({ postId, authorId }: { postId: string; authorId: string | null }) {
  const [status, setStatus] = useState<string | null>(null);

  const report = async () => {
    const reason = window.prompt('What’s wrong with this post? A moderator will take a look.');
    if (reason === null) return;
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType: 'post', targetId: postId, reason }),
    });
    setStatus(res.ok ? 'Thanks. A moderator will look at it soon.' : res.status === 401 ? 'Sign in to report.' : 'Couldn’t send that, please try again.');
  };

  const block = async () => {
    if (!authorId || !window.confirm('Block this neighbour? They won’t be able to message you.')) return;
    const res = await fetch('/api/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: authorId }),
    });
    setStatus(res.ok ? 'Blocked. You won’t hear from them.' : res.status === 401 ? 'Sign in to block.' : 'Couldn’t block, please try again.');
  };

  return (
    <div className="mt-10 pt-4 flex flex-wrap items-center gap-4 text-sm color-sub" style={{ borderTop: '1px dashed var(--border)' }}>
      <button onClick={report} className="inline-flex items-center gap-1.5 min-h-[44px] hover:underline"><Flag className="w-4 h-4" /> Report post</button>
      {authorId && <button onClick={block} className="inline-flex items-center gap-1.5 min-h-[44px] hover:underline"><Ban className="w-4 h-4" /> Block neighbour</button>}
      {status && <span className="w-full text-xs" role="status">{status}</span>}
    </div>
  );
}
