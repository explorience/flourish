'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PostCard } from '@/components/post-card';
import { ArrowLeft, Search, X } from 'lucide-react';
import Link from 'next/link';
import type { PostWithResponses } from '@/types/database';

export function SearchClient() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PostWithResponses[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    const supabase = createClient();

    // Search in title and details using ilike
    const searchTerm = `%${q.trim()}%`;
    const { data } = await supabase
      .from('posts')
      .select('*, responses(*)')
      .eq('status', 'active')
      .or(`title.ilike.${searchTerm},details.ilike.${searchTerm},contact_name.ilike.${searchTerm}`)
      .order('created_at', { ascending: false })
      .limit(50);

    setResults(data || []);
    setLoading(false);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[hsl(39,50%,96%)]/80 border-b border-[hsl(35,25%,87%)]">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-full hover:bg-[hsl(35,30%,90%)] text-[hsl(25,15%,45%)] transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(25,15%,60%)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[hsl(35,20%,87%)] bg-white focus:outline-none search-glow focus:border-[hsl(25,45%,35%)] text-sm text-[hsl(25,20%,20%)] placeholder:text-[hsl(25,15%,65%)] transition-all"
              placeholder="Search posts..."
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[hsl(35,30%,90%)] text-[hsl(25,15%,55%)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-6">
        {loading && (
          <div className="text-center py-12">
            <div className="w-5 h-5 border-2 border-[hsl(25,45%,35%)] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16 animate-fade-up">
            <p className="text-xl font-semibold text-[hsl(25,20%,30%)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              No matches
            </p>
            <p className="text-[hsl(25,15%,50%)] text-sm">
              Try different words or browse the main feed.
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-xs text-[hsl(25,12%,55%)] mb-4">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>
            <div className="space-y-4 stagger-children">
              {results.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}

        {!searched && (
          <div className="text-center py-16 animate-fade-up">
            <p className="text-lg text-[hsl(25,15%,50%)]" style={{ fontFamily: 'var(--font-display)' }}>
              Search for needs, offers, or people
            </p>
          </div>
        )}
      </div>
    </>
  );
}
