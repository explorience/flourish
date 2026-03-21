'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { RespondDialog } from '@/components/respond-dialog';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import type { PostWithResponses } from '@/types/database';

interface PostDetailClientProps {
  post: PostWithResponses;
}

export function PostDetailClient({ post }: PostDetailClientProps) {
  const [showRespond, setShowRespond] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [threading, setThreading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  const isPoster = currentUserId && post.user_id === currentUserId;
  const isNeed = post.type === 'need';

  const startThread = async (responderId: string) => {
    if (!responderId) return;
    setThreading(responderId);
    const res = await fetch('/api/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id, responderId }),
    });
    if (res.ok) {
      const { threadId } = await res.json();
      router.push(`/messages/${threadId}`);
    }
    setThreading(null);
  };

  const ds = { fontFamily: 'var(--font-display)' } as React.CSSProperties;
  const sr = { fontFamily: 'var(--font-serif)' } as React.CSSProperties;

  return (
    <>
      {/* Respond button — shown to non-posters */}
      {!isPoster && post.status === 'active' && (
        <div className="mb-8">
          <button
            onClick={() => setShowRespond(true)}
            className="w-full py-4 text-sm font-bold uppercase tracking-wider transition-all"
            style={{ ...ds, background: isNeed ? 'var(--need)' : 'var(--offer)', color: 'var(--card)' }}
          >
            {isNeed ? 'I can help with this' : 'I\'m interested in this'}
          </button>
        </div>
      )}

      {/* Responses — visible to all */}
      {post.responses && post.responses.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ ...ds, color: 'var(--heading)' }}>
            {post.responses.length} {post.responses.length === 1 ? 'Response' : 'Responses'}
          </h2>
          <div className="space-y-3">
            {post.responses.map((r: any) => (
              <div
                key={r.id}
                className="p-4"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                        {r.responder_name}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {r.message && (
                      <p className="text-sm leading-relaxed" style={{ ...sr, color: 'var(--ink-light)', fontStyle: 'italic' }}>
                        &ldquo;{r.message}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Message button — only shown to poster, only if responder has a user_id */}
                  {isPoster && r.user_id && (
                    <button
                      onClick={() => startThread(r.user_id)}
                      disabled={threading === r.user_id}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40"
                      style={{
                        ...ds,
                        fontSize: '0.6rem',
                        border: '1.5px solid var(--offer)',
                        color: 'var(--offer)',
                        background: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--offer)';
                        e.currentTarget.style.color = 'var(--card)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--offer)';
                      }}
                    >
                      <MessageSquare className="w-3 h-3" />
                      {threading === r.user_id ? 'Opening…' : 'Message'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {post.status === 'active' && post.responses.length === 0 && !isPoster && (
        <p className="text-sm text-center italic mt-4" style={{ ...sr, color: 'var(--ink-muted)' }}>
          No responses yet — be the first.
        </p>
      )}

      <RespondDialog post={post} open={showRespond} onClose={() => setShowRespond(false)} />
    </>
  );
}
