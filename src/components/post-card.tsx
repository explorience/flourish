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
        className={`card-tilt ${tiltClass} ${marginClass} relative cursor-pointer`}
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '2px 3px 12px rgba(0,0,0,0.2)',
          padding: '18px 20px',
        }}
        onClick={() => window.location.href = `/post/${post.id}`}
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
            style={{ color: 'var(--ink)', fontSize: '0.88rem' }}
          >
            {post.details}
          </p>
        )}

        {/* Footer */}
        <div className="pt-2" style={{ borderTop: '1px dashed var(--border-card)' }}>
          {/* Meta row */}
          <div className="flex items-center gap-1 flex-wrap mb-2" style={{ color: 'var(--ink-light)', fontSize: '0.72rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{post.contact_name}</span>
            <span>&mdash;</span>
            <span>{timeAgo}</span>
            {post.location_label && (
              <>
                <span>&mdash;</span>
                <span className="truncate" style={{ maxWidth: '120px' }}>{post.location_label}</span>
              </>
            )}
            {!post.location_label && categoryInfo && (
              <>
                <span>&mdash;</span>
                <span>{categoryInfo.label}</span>
              </>
            )}
            {post.source === 'sms' && (
              <span className="px-1.5 py-0.5 uppercase tracking-wider"
                style={{ fontSize: '0.55rem', background: 'rgba(58,106,74,0.15)', color: 'var(--offer)' }}>
                sms
              </span>
            )}
            {post.responses.length > 0 && (
              <span style={{ color: 'var(--ink-muted)', fontSize: '0.68rem' }}>
                &mdash; {post.responses.length} {post.responses.length === 1 ? 'response' : 'responses'}
              </span>
            )}
          </div>

          {/* Action button */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowRespond(true); }}
            className="w-full py-2 text-xs font-bold uppercase tracking-wider transition-all"
            style={{
              border: `2px solid ${isNeed ? 'var(--need)' : 'var(--offer)'}`,
              color: isNeed ? 'var(--need)' : 'var(--offer)',
              background: 'transparent',
              fontFamily: 'var(--font-display)',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
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
            {isNeed ? 'I can help' : 'I\'m interested'}
          </button>
        </div>
      </article>

      <RespondDialog
        post={post}
        open={showRespond}
        onClose={() => setShowRespond(false)}
      />
    </>
  );
}
