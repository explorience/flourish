'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PostCard } from './post-card';
import { FilterBar } from './filter-bar';
import { CreatePostButton } from './create-post-button';
import type { PostWithResponses, PostType, Category } from '@/types/database';

interface PostFeedProps {
  initialPosts: PostWithResponses[];
  isModerator?: boolean;
}

export function PostFeed({ initialPosts, isModerator = false }: PostFeedProps) {
  const [posts, setPosts] = useState<PostWithResponses[]>(initialPosts);
  const [typeFilter, setTypeFilter] = useState<PostType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('posts-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        const newPost = { ...payload.new, responses: [] } as unknown as PostWithResponses;
        setPosts((prev) => [newPost, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
        const updated = payload.new as any;
        if (updated.status !== 'active') {
          setPosts((prev) => prev.filter((p) => p.id !== updated.id));
        } else {
          setPosts((prev) => prev.map((p) => p.id === updated.id ? { ...p, ...updated } : p));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'responses' }, (payload) => {
        const r = payload.new as any;
        setPosts((prev) => prev.map((p) => p.id === r.post_id ? { ...p, responses: [...p.responses, r] } : p));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = posts.filter((post) => {
    if (typeFilter !== 'all' && post.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && post.category !== categoryFilter) return false;
    return post.status === 'active';
  });

  return (
    <div className="w-full max-w-7xl mx-auto">
      <FilterBar
        typeFilter={typeFilter}
        categoryFilter={categoryFilter}
        onTypeChange={setTypeFilter}
        onCategoryChange={setCategoryFilter}
        totalCount={posts.filter(p => p.status === 'active').length}
        filteredCount={filtered.length}
      />
      
      {filtered.length === 0 ? (
        <div className="text-center py-16 animate-fade-up w-full">
          <p
            className="text-xl font-bold uppercase tracking-wide mb-2 font-display color-heading"
          >
            {posts.length === 0 ? 'No posts yet' : 'Nothing matches'}
          </p>
          <p className="text-sm mb-8 color-sub">
            {posts.length === 0
              ? 'Be the first to share a need or offer!'
              : 'Try adjusting your filters.'}
          </p>
          {posts.length === 0 && <CreatePostButton />}
        </div>
      ) : (
        <div
          className="mt-5"
          style={{
            columnCount: 'auto' as any,
            columnWidth: '18.75rem',
            columnGap: '1rem',
          }}
        >
          {filtered.map((post, i) => (
            <div key={post.id} style={{ breakInside: 'avoid', marginBottom: '1rem' }}>
              <PostCard post={post} index={i} isModerator={isModerator} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
