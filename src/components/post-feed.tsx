'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PostCard } from './post-card';
import { FilterBar } from './filter-bar';
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
          setPosts((prev) =>
            prev.map((p) =>
              p.id === payload.new.id ? { ...p, ...payload.new } : p
            )
          );
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
      />
      
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-amber-600">
          <p className="text-xl mb-2">Nothing here yet!</p>
          <p>Be the first to post a need or offer.</p>
        </div>
      ) : (
        <div className="space-y-4 mt-4">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
