'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isVouchRequiredClient } from '@/lib/settings-client';
import { RespondDialog } from '@/components/respond-dialog';
import { EditPostForm } from '@/components/edit-post-form';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Pencil, RefreshCw } from 'lucide-react';
import type { PostWithResponses } from '@/types/database';

interface PostDetailClientProps {
  post: PostWithResponses;
  isModerator?: boolean;
}

export function PostDetailClient({ post, isModerator = false }: PostDetailClientProps) {
  const [showRespond, setShowRespond] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [extending, setExtending] = useState(false);
  const [extendedUntil, setExtendedUntil] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [vouchStatus, setVouchStatus] = useState<string>('unvouched');
  const [vouchRequired, setVouchRequired] = useState(false);
  const [threading, setThreading] = useState<string | null>(null);
  const [modAction, setModAction] = useState<'approved' | 'rejected' | null>(null);
  const [moderating, setModerating] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    isVouchRequiredClient().then(setVouchRequired);
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
      if (data.user) {
        supabase.from('profiles').select('vouch_status').eq('id', data.user.id).single()
          .then(({ data: profile }) => {
            if (profile?.vouch_status) setVouchStatus(profile.vouch_status);
          });
      }
    });
  }, []);

  const isPoster = currentUserId && post.user_id === currentUserId;
  const isNeed = post.type === 'need';

  const handleModerate = async (action: 'approve' | 'reject', reason?: string) => {
    setModerating(true);
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, action, reason }),
      });
      if (res.ok) {
        setModAction(action === 'approve' ? 'approved' : 'rejected');
        setShowRejectInput(false);
      }
    } catch (err) {
      console.error('Moderation error:', err);
    } finally {
      setModerating(false);
    }
  };

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

  return (
    <>
      {/* Respond button — shown to non-posters, vouched users only */}
      {!isPoster && post.status === 'active' && (
        <div className="mb-8">
          {currentUserId && vouchRequired && vouchStatus === 'unvouched' ? (
            <div className="w-full py-4 px-4 text-center text-sm border-dashed-theme" style={{ background: 'rgba(240,236,224,0.08)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1 font-display color-sub">
                Vouch needed to respond
              </p>
              <p className="text-xs font-serif color-ink-muted">
                Ask a member to vouch for you, or <a href="/join" className="color-offer" style={{ textDecoration: 'underline' }}>use an invite link</a>
              </p>
            </div>
          ) : (
            <button
              onClick={() => currentUserId ? setShowRespond(true) : window.location.assign('/auth?next=/post/' + post.id)}
              className="w-full py-4 text-sm font-bold uppercase tracking-wider transition-all font-display color-card"
              style={{ background: isNeed ? 'var(--need)' : 'var(--offer)' }}
            >
              {isNeed ? 'I can help with this' : 'I\'m interested in this'}
            </button>
          )}
        </div>
      )}

      {/* Edit button — shown to post owner only */}
      {isPoster && post.status === 'active' && (
        <div className="mb-6">
          <button
            onClick={() => setShowEdit(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all"
            style={{
              ...ds,
              fontSize: '0.6rem',
              border: '1.5px solid var(--border-card)',
              color: 'var(--ink-muted)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--ink)';
              e.currentTarget.style.color = 'var(--ink)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-card)';
              e.currentTarget.style.color = 'var(--ink-muted)';
            }}
          >
            <Pencil className="w-3 h-3" />
            Edit post
          </button>
        </div>
      )}

      {/* Moderation panel — moderators only */}
      {isModerator && (
        <div
          className="mb-8 p-4"
          style={{ border: '1px dashed rgba(208,112,64,0.4)', background: 'rgba(208,112,64,0.04)' }}
        >
          <div
            className="text-xs font-bold uppercase tracking-wider mb-3 font-display color-need"
            style={{ fontSize: '0.6rem', letterSpacing: '0.14em' }}
          >
            Moderation
          </div>

          {modAction ? (
            <div
              className="text-sm font-bold uppercase tracking-wider font-display"
              style={{ color: modAction === 'approved' ? 'var(--offer)' : 'var(--need)' }}
            >
              {modAction === 'approved' ? '✓ Approved' : '✕ Rejected'}
            </div>
          ) : showRejectInput ? (
            <div className="flex gap-2 items-center flex-wrap">
              <input
                type="text"
                placeholder="Rejection reason (optional)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{
                  flex: '1 1 200px',
                  background: 'var(--card)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--ink)',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => handleModerate('reject', rejectReason)}
                disabled={moderating}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-40 font-display btn-need"
              >
                {moderating ? '…' : 'Confirm Reject'}
              </button>
              <button
                onClick={() => setShowRejectInput(false)}
                className="text-xs color-ink-muted"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => handleModerate('approve')}
                disabled={moderating}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-colors font-display"
                style={{ background: 'var(--offer)', color: 'white', letterSpacing: '0.1em' }}
              >
                ✓ Approve
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={moderating}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-colors font-display"
                style={{ background: 'var(--need)', color: 'white', letterSpacing: '0.1em' }}
              >
                ✕ Reject
              </button>
            </div>
          )}
        </div>
      )}

      {/* Responses — visible to all */}
      {post.responses && post.responses.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide mb-4 font-display color-heading">
            {post.responses.length} {post.responses.length === 1 ? 'Response' : 'Responses'}
          </h2>
          <div className="space-y-3">
            {post.responses.map((r: any) => (
              <div
                key={r.id}
                className="p-4 card-theme"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium color-ink">
                        {r.responder_name}
                      </span>
                      <span className="text-xs color-ink-muted">
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {r.message && (
                      <p className="text-sm leading-relaxed font-serif color-ink-light" style={{ fontStyle: 'italic' }}>
                        &ldquo;{r.message}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Message button — only shown to poster, only if responder has a user_id */}
                  {isPoster && r.user_id && (
                    <button
                      onClick={() => startThread(r.user_id)}
                      disabled={threading === r.user_id}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 font-display"
                      style={{
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
        <p className="text-sm text-center italic mt-4 font-serif color-ink-muted">
          No responses yet — be the first.
        </p>
      )}

      <RespondDialog post={post} open={showRespond} onClose={() => setShowRespond(false)} />

      {showEdit && (
        <EditPostForm
          post={post}
          onClose={() => setShowEdit(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}
