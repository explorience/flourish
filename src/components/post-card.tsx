'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CATEGORIES, URGENCIES, POST_TYPES } from '@/lib/constants';
import { RespondDialog } from './respond-dialog';
import { MessageCircle, Clock } from 'lucide-react';
import type { PostWithResponses } from '@/types/database';

interface PostCardProps {
  post: PostWithResponses;
}

export function PostCard({ post }: PostCardProps) {
  const [showRespond, setShowRespond] = useState(false);
  
  const typeInfo = POST_TYPES.find((t) => t.value === post.type);
  const categoryInfo = CATEGORIES.find((c) => c.value === post.category);
  const urgencyInfo = URGENCIES.find((u) => u.value === post.urgency);
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  return (
    <>
      <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        {/* Header */}
        <div className={`px-4 py-2 flex items-center justify-between ${
          post.type === 'need' ? 'bg-orange-50 border-b border-orange-100' : 'bg-emerald-50 border-b border-emerald-100'
        }`}>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${typeInfo?.color}`}>
            {typeInfo?.emoji} {typeInfo?.label}
          </span>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${urgencyInfo?.color}`}>
              <Clock className="w-3 h-3" />
              {urgencyInfo?.label}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-amber-900 mb-1">{post.title}</h3>
          {post.details && (
            <p className="text-amber-700 text-sm mb-3">{post.details}</p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-amber-500">
              <span>{categoryInfo?.emoji} {categoryInfo?.label}</span>
              <span>·</span>
              <span>{timeAgo}</span>
              <span>·</span>
              <span>by {post.contact_name}</span>
              {post.source === 'sms' && (
                <>
                  <span>·</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">via SMS</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 bg-amber-50/50 border-t border-amber-100 flex items-center justify-between">
          <button
            onClick={() => setShowRespond(true)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              post.type === 'need'
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            {post.type === 'need' ? 'I can help!' : "I'm interested!"}
          </button>
          
          {post.responses.length > 0 && (
            <span className="text-sm text-amber-600">
              {post.responses.length} {post.responses.length === 1 ? 'response' : 'responses'}
            </span>
          )}
        </div>
      </div>

      <RespondDialog
        post={post}
        open={showRespond}
        onClose={() => setShowRespond(false)}
      />
    </>
  );
}
