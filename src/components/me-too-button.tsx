'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Hand } from 'lucide-react';

interface MeTooButtonProps {
  postId: string;
  postType: 'need' | 'offer';
  isOwner?: boolean;
  compact?: boolean; // For card display (count only, no toggle)
}

export function MeTooButton({ postId, postType, isOwner = false, compact = false }: MeTooButtonProps) {
  const [count, setCount] = useState(0);
  const [upvoted, setUpvoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (postType !== 'need') return;
    fetch(`/api/posts/${postId}/metoo`)
      .then(r => r.json())
      .then(data => {
        setCount(data.count || 0);
        setUpvoted(data.upvoted || false);
      })
      .catch(() => {});
  }, [postId, postType]);

  // Only show on need posts
  if (postType !== 'need') return null;

  // Compact mode: just show count text on cards
  if (compact) {
    if (count === 0) return null;
    return (
      <span
        className="inline-flex items-center gap-1"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.55rem',
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.08em',
          color: 'var(--need)',
          opacity: 0.8,
        }}
      >
        <Hand className="w-3 h-3" />
        {count} {count === 1 ? 'other' : 'others'} need this too
      </span>
    );
  }

  // Don't show toggle for post owner
  if (isOwner) {
    if (count === 0) return null;
    return (
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.6rem',
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.1em',
          color: 'var(--need)',
        }}
      >
        <Hand className="w-3.5 h-3.5" />
        {count} {count === 1 ? 'person' : 'people'} also {count === 1 ? 'needs' : 'need'} this
      </div>
    );
  }

  const toggle = async () => {
    setLoading(true);
    // Optimistic update
    setUpvoted(!upvoted);
    setCount(c => upvoted ? Math.max(0, c - 1) : c + 1);

    try {
      const res = await fetch(`/api/posts/${postId}/metoo`, { method: 'POST' });
      if (res.status === 401) {
        // Not logged in — revert and redirect
        setUpvoted(upvoted);
        setCount(c => upvoted ? c + 1 : Math.max(0, c - 1));
        router.push('/auth');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
        setUpvoted(data.upvoted);
      }
    } catch {
      // Revert on error
      setUpvoted(upvoted);
      setCount(c => upvoted ? c + 1 : Math.max(0, c - 1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 transition-all disabled:opacity-60"
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.6rem',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
        border: upvoted ? '1.5px solid var(--need)' : '1.5px solid var(--border)',
        color: upvoted ? 'var(--need)' : 'var(--sub)',
        background: upvoted ? 'rgba(208, 112, 64, 0.08)' : 'transparent',
        cursor: 'pointer',
      }}
    >
      <Hand className="w-3.5 h-3.5" style={{ fill: upvoted ? 'var(--need)' : 'none' }} />
      {upvoted ? 'Me too!' : 'Me too'}
      {count > 0 && <span style={{ opacity: 0.7 }}>({count})</span>}
    </button>
  );
}
