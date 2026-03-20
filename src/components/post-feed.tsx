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
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          const newPost = { ...payload.new, responses: [] } as unknown as PostWithResponses;
          setPosts((prev) => [newPost, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          const updated = payload.new as any;
          if (updated.status !== 'active') {
            setPosts((prev) => prev.filter((p) => p.id !== updated.id));
          } else {
            setPosts((prev) =>
              prev.map((p) => p.id === updated.id ? { ...p, ...updated } : p)
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'responses' },
        (payload) => {
          const newResponse = payload.new as any;
          setPosts((prev) =>
            prev.map((p) =>
              p.id === newResponse.post_id
                ? { ...p, responses: [...p.responses, newResponse] }
                : p
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = posts.filter((post) => {
    if (typeFilter !== 'all' && post.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && post.category !== categoryFilter) return false;
    if (post.status !== 'active') return false;
    return true;
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
        <div className="text-center py-20 animate-fade-up">
          <p className="text-2xl font-semibold text-[hsl(25,20%,30%)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {posts.length === 0 ? 'The board is quiet' : 'Nothing matches'}
          </p>
          <p className="text-[hsl(25,15%,50%)] mb-8 max-w-sm mx-auto">
            {posts.length === 0 
              ? 'Be the first to share something with your neighbours.'
              : 'Try adjusting your filters.'}
          </p>
          {posts.length === 0 && <CreatePostButton />}
        </div>
      ) : (
        <div className="space-y-4 mt-6 stagger-children">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
