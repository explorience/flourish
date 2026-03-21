'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CATEGORIES } from '@/lib/constants';
import { RespondDialog } from './respond-dialog';
import Link from 'next/link';
import type { PostWithResponses } from '@/types/database';

interface PostCardProps {
  post: PostWithResponses;
  index?: number;
}

export function PostCard({ post, index = 0 }: PostCardProps) {
  const [showRespond, setShowRespond] = useState(false);
  
  const categoryInfo = CATEGORIES.find((c) => c.value === post.category);
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const isNeed = post.type === 'need';
  const tiltClass = index % 2 === 0 ? 'card-rotate-left' : 'card-rotate-right';
  const marginClass = index % 2 === 1 ? 'ml-4' : '';

  return (
    <>
      <article
        className={`card-tilt ${tiltClass} ${marginClass} relative`}
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '2px 3px 12px rgba(0,0,0,0.2)',
          padding: '18px 20px',
        }}
      >
        {/* Tape strip */}
        <div className={`tape ${isNeed ? 'tape-need' : 'tape-offer'}`} />

        {/* Type label */}
        <div
          className="text-xs font-bold uppercase tracking-wider mb-2"
          style={{
            color: isNeed ? 'var(--need)' : 'var(--offer)',
            fontFamily: 'var(--font-display)',
            fontSize: '0.62rem',
            letterSpacing: '0.15em',
          }}
        >
          {isNeed ? 'Need' : 'Offer'}
        </div>

        {/* Title */}
        <Link href={`/post/${post.id}`}>
          <h3
            className="text-base leading-snug mb-1 hover:underline"
            style={{
              color: 'var(--ink)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 400,
              lineHeight: 1.3,
            }}
          >
            {post.title}
          </h3>
        </Link>

        {/* Details */}
        {post.details && (
          <p
            className="text-sm leading-relaxed mb-2 line-clamp-2"
            style={{ color: 'var(--ink-light)', fontSize: '0.82rem' }}
          >
            {post.details}
          </p>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-2"
          style={{ borderTop: '1px dashed var(--border-card)' }}
        >
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--ink-muted)', fontSize: '0.7rem' }}>
            <span style={{ fontWeight: 500, color: 'var(--ink-light)' }}>{post.contact_name}</span>
            <span> &mdash; </span>
            <span>{timeAgo}</span>
            {categoryInfo && (
              <>
                <span> &mdash; </span>
                <span>{categoryInfo.label}</span>
              </>
            )}
            {post.source === 'sms' && (
              <span
                className="ml-1 px-1.5 py-0.5 uppercase tracking-wider"
                style={{ fontSize: '0.55rem', background: 'rgba(58,106,74,0.15)', color: 'var(--offer)' }}
              >
                sms
              </span>
            )}
          </div>

          <button
            onClick={() => setShowRespond(true)}
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all"
            style={{
              border: `2px solid ${isNeed ? 'var(--need)' : 'var(--offer)'}`,
              color: isNeed ? 'var(--need)' : 'var(--offer)',
              background: 'transparent',
              fontFamily: 'var(--font-display)',
              fontSize: '0.68rem',
              letterSpacing: '0.08em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isNeed ? 'var(--need)' : 'var(--offer)';
              e.currentTarget.style.color = 'var(--card)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = isNeed ? 'var(--need)' : 'var(--offer)';
            }}
          >
            {isNeed ? 'I can help' : 'Interested'}
          </button>
        </div>

        {post.responses.length > 0 && (
          <div className="text-xs mt-2" style={{ color: 'var(--ink-muted)', fontSize: '0.68rem' }}>
            {post.responses.length} {post.responses.length === 1 ? 'response' : 'responses'}
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
