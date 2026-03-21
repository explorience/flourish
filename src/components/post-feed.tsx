'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PostCard } from './post-card';
import { FilterBar } from './filter-bar';
import { CreatePostButton } from './create-post-button';
import type { PostWithResponses, PostType, Category } from '@/types/database';

interface PostFeedProps {
  initialPosts: PostWithResponses[];
}

export function PostFeed({ initialPosts }: PostFeedProps) {
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
    <div>
      <FilterBar
        typeFilter={typeFilter}
        categoryFilter={categoryFilter}
        onTypeChange={setTypeFilter}
        onCategoryChange={setCategoryFilter}
        totalCount={posts.filter(p => p.status === 'active').length}
        filteredCount={filtered.length}
      />
      
      {filtered.length === 0 ? (
        <div className="text-center py-16 animate-fade-up">
          <p
            className="text-xl font-bold uppercase tracking-wide mb-2"
            style={{ color: 'var(--heading)', fontFamily: 'var(--font-display)' }}
          >
            {posts.length === 0 ? 'The board is quiet' : 'Nothing matches'}
          </p>
          <p className="text-sm mb-8" style={{ color: 'var(--sub)' }}>
            {posts.length === 0
              ? 'Be the first to share something with your neighbours.'
              : 'Try adjusting your filters.'}
          </p>
          {posts.length === 0 && <CreatePostButton />}
        </div>
      ) : (
        <div
          className="mt-5"
          style={{
            columnCount: 'auto',
            columnWidth: '280px',
            columnGap: '16px',
          }}
        >
          {filtered.map((post, i) => (
            <div key={post.id} style={{ breakInside: 'avoid', marginBottom: '16px' }}>
              <PostCard post={post} index={i} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
