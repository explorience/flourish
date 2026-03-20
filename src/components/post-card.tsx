'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CATEGORIES, URGENCIES } from '@/lib/constants';
import { RespondDialog } from './respond-dialog';
import { MessageCircle, Clock, Package, HandHelping, Lightbulb, Home, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { PostWithResponses } from '@/types/database';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  items: <Package className="w-3.5 h-3.5" />,
  services: <HandHelping className="w-3.5 h-3.5" />,
  skills: <Lightbulb className="w-3.5 h-3.5" />,
  space: <Home className="w-3.5 h-3.5" />,
  other: <Sparkles className="w-3.5 h-3.5" />,
};

interface PostCardProps {
  post: PostWithResponses;
}

export function PostCard({ post }: PostCardProps) {
  const [showRespond, setShowRespond] = useState(false);
  
  const categoryInfo = CATEGORIES.find((c) => c.value === post.category);
  const urgencyInfo = URGENCIES.find((u) => u.value === post.urgency);
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const isNeed = post.type === 'need';

  return (
    <>
      <article className="group card-lift bg-[hsl(var(--card))] rounded-2xl border border-[hsl(35,25%,89%)] overflow-hidden">
        {/* Type indicator bar */}
        <div className={`h-1 ${isNeed ? 'type-bar-need' : 'type-bar-offer'}`} />
        
        <div className="p-5">
          {/* Meta row */}
          <div className="flex items-center gap-2 mb-3 text-xs text-[hsl(25,15%,55%)]">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium ${
              isNeed 
                ? 'bg-[hsl(18,50%,95%)] text-[hsl(18,60%,42%)]' 
                : 'bg-[hsl(145,30%,94%)] text-[hsl(145,35%,32%)]'
            }`}>
              {isNeed ? 'Looking for' : 'Offering'}
            </span>
            
            <span className="inline-flex items-center gap-1 text-[hsl(25,15%,60%)]">
              {CATEGORY_ICONS[post.category]}
              {categoryInfo?.label}
            </span>

            {post.urgency !== 'flexible' && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                post.urgency === 'today' 
                  ? 'bg-[hsl(0,50%,95%)] text-[hsl(0,50%,42%)]' 
                  : 'bg-[hsl(40,50%,93%)] text-[hsl(35,50%,35%)]'
              }`}>
                <Clock className="w-3 h-3" />
                {urgencyInfo?.label}
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/post/${post.id}`} className="block group/link">
            <h3 className="text-lg font-semibold text-[hsl(25,30%,18%)] leading-snug mb-1.5 group-hover/link:text-[hsl(25,45%,30%)] transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
              {post.title}
            </h3>
          </Link>

          {/* Details */}
          {post.details && (
            <p className="text-[hsl(25,15%,40%)] text-sm leading-relaxed line-clamp-2 mb-3">
              {post.details}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[hsl(35,20%,92%)]">
            <div className="flex items-center gap-2 text-xs text-[hsl(25,12%,55%)]">
              <span className="font-medium text-[hsl(25,20%,35%)]">{post.contact_name}</span>
              <span className="text-[hsl(25,10%,78%)]">/</span>
              <span>{timeAgo}</span>
              {post.source === 'sms' && (
                <span className="px-1.5 py-0.5 rounded bg-[hsl(210,40%,95%)] text-[hsl(210,40%,45%)] text-[10px] font-medium uppercase tracking-wider">
                  sms
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {post.responses.length > 0 && (
                <span className="text-xs text-[hsl(25,15%,55%)]">
                  {post.responses.length}
                </span>
              )}
              <button
                onClick={() => setShowRespond(true)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isNeed
                    ? 'bg-[hsl(18,60%,52%)] hover:bg-[hsl(18,60%,46%)] text-white'
                    : 'bg-[hsl(145,30%,42%)] hover:bg-[hsl(145,30%,36%)] text-white'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {isNeed ? 'I can help' : 'Interested'}
              </button>
            </div>
          </div>
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
