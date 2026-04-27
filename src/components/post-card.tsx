'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CATEGORIES } from '@/lib/constants';
import { RespondDialog } from './respond-dialog';
import Link from 'next/link';
import { MeTooButton } from './me-too-button';
import type { PostWithResponses, PostWithProfile } from '@/types/database';

interface PostCardProps {
  post: PostWithResponses | PostWithProfile;
  index?: number;
  isModerator?: boolean;
}

export function PostCard({ post, index = 0, isModerator = false }: PostCardProps) {
  const [showRespond, setShowRespond] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [modDone, setModDone] = useState<'approved' | 'rejected' | null>(
    post.moderation_status === 'approved' || post.moderation_status === 'rejected' ? post.moderation_status : null
  );
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleModerate = async (action: 'approve' | 'reject', reason?: string) => {
    setModerating(true);
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, action, reason }),
      });
      if (res.ok) {
        setModDone(action === 'approve' ? 'approved' : 'rejected');
        setShowRejectInput(false);
      }
    } catch (err) {
      console.error('Moderation error:', err);
    } finally {
      setModerating(false);
    }
  };
  
  const categoryInfo = CATEGORIES.find((c) => c.value === post.category);
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const isNeed = post.type === 'need';
  return (
    <>
      <article
        className="bg-card rounded-lg shadow-md transition-all hover:scale-[1.01] hover:shadow-lg relative cursor-pointer p-5"
        style={{ border: '1px solid var(--border-card)' }}
        onClick={() => window.location.href = `/post/${post.id}`}
      >

        {/* Type label */}
        <div
          className="text-xs font-bold uppercase tracking-wider mb-2 font-display"
          style={{ color: isNeed ? 'var(--need)' : 'var(--offer)' }}
        >
          {isNeed ? 'Need' : 'Offer'}
        </div>

        {/* Title */}
        <Link href={`/post/${post.id}`}>
          {post.image_urls && post.image_urls.length > 0 && (
            <div className="mb-2">
              <img
                src={post.image_urls[0]}
                alt=""
                className="w-full object-cover rounded-md h-36"
                loading="lazy"
              />
              {post.image_urls.length > 1 && (
                <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
                  +{post.image_urls.length - 1} more photo{post.image_urls.length > 2 ? 's' : ''}
                </p>
              )}
            </div>
          )}
          <h3
            className="text-lg leading-snug mb-1 hover:underline font-display color-ink"
          >
            {post.title}
          </h3>
        </Link>

        {/* Details */}
        {post.details && (
          <p
            className="text-base leading-relaxed mb-2 line-clamp-2 color-ink"
          >
            {post.details}
          </p>
        )}

        {/* Footer */}
        <div className="pt-3 mt-3 border-t border-border-card">
          {/* Meta row */}
          <div className="flex items-center gap-x-1.5 flex-wrap mb-2 text-sm color-ink-light">
            <span>{(post as any).profiles?.display_name || post.contact_name}</span>
            {(post as any).profiles?.neighbourhood && (
              <>
                <span>&mdash;</span>
                <span className="color-offer">
                  {(post as any).profiles.neighbourhood}
                </span>
              </>
            )}
            <span>&mdash;</span>
            <span>{timeAgo}</span>
            {(post.location_crossstreet || post.location_label) && (
              <>
                <span>&mdash;</span>
                <span className="truncate" style={{ maxWidth: '7.5rem' }}>{post.location_crossstreet || post.location_label}</span>
              </>
            )}
            {!post.location_crossstreet && !post.location_label && categoryInfo && (
              <>
                <span>&mdash;</span>
                <span>{categoryInfo.label}</span>
              </>
            )}

            {'responses' in post && post.responses.length > 0 && (
              <span className="text-xs color-ink-muted">
                &mdash; {post.responses.length} {post.responses.length === 1 ? 'response' : 'responses'}
              </span>
            )}
          </div>

          {/* Me too count for need posts */}
          <MeTooButton postId={post.id} postType={post.type as 'need' | 'offer'} compact />

          {/* Action button */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowRespond(true); }}
            className={`w-full py-2 text-sm font-bold uppercase tracking-wider transition-all font-display rounded-md
              ${isNeed ? 'btn-outline-need' : 'btn-outline-offer'}`}
          >
            {isNeed ? 'I can help' : 'I\'m interested'}
          </button>
        </div>
        {/* Moderation bar — moderators only */}
        {isModerator && (
          <div
            className="mt-3 pt-3 border-t border-border-card"
            onClick={(e) => e.stopPropagation()}
          >
            {modDone ? (
              <div
                className={`text-center text-xs font-bold uppercase tracking-wider py-1 font-display
              ${modDone === 'approved' ? 'color-offer' : 'color-need'}`}
              >
                {modDone === 'approved' ? '✓ Approved' : '✕ Rejected'}
              </div>
            ) : showRejectInput ? (
              <div className="flex gap-1.5 items-center">
                <input
                  type="text"
                  placeholder="Reason (optional)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm bg-white border border-border-card color-ink font-body focus:outline-none rounded-sm"
                />
                <button
                  onClick={() => handleModerate('reject', rejectReason)}
                  disabled={moderating}
                  className="px-2 py-1 text-xs font-bold uppercase disabled:opacity-40 font-display bg-need color-card rounded-sm"
                >
                  {moderating ? '…' : 'Reject'}
                </button>
                <button
                  onClick={() => setShowRejectInput(false)}
                  className="px-1.5 py-1 text-xs color-ink-muted"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleModerate('approve')}
                  disabled={moderating}
                  className="flex-1 py-1 text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-colors font-display bg-offer color-card rounded-sm"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => setShowRejectInput(true)}
                  disabled={moderating}
                  className="flex-1 py-1 text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-colors font-display bg-need color-card rounded-sm"
                >
                  ✕ Reject
                </button>
              </div>
            )}
          </div>
        )}
      </article>

      <RespondDialog
        post={post}
        open={showRespond}
        onClose={() => setShowRespond(false)}
      />
    </>
  );
}
