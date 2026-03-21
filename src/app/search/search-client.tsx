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
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true); setSearched(true);
    const supabase = createClient();
    const term = `%${q.trim()}%`;
    const { data } = await supabase.from('posts').select('*, responses(*)')
      .eq('status', 'active')
      .or(`title.ilike.${term},details.ilike.${term},contact_name.ilike.${term}`)
      .order('created_at', { ascending: false }).limit(50);
    setResults(data || []); setLoading(false);
  }, []);

  useEffect(() => { const t = setTimeout(() => search(query), 300); return () => clearTimeout(t); }, [query, search]);

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(26,42,32,0.9)', borderColor: 'var(--border)' }}>
        <div className="max-w-xl mx-auto px-5 h-13 flex items-center gap-3">
          <Link href="/" className="p-1.5 flex-shrink-0" style={{ color: 'var(--sub)' }}><ArrowLeft className="w-4 h-4" /></Link>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--ink-muted)' }} />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm focus:outline-none search-glow transition-all"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--ink)' }}
              placeholder="Search posts..." autoFocus
            />
            {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5" style={{ color: 'var(--ink-muted)' }}><X className="w-3.5 h-3.5" /></button>}
          </div>
        </div>
      </header>
      <div className="max-w-xl mx-auto px-5 py-6">
        {loading && <div className="text-center py-12"><div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--heading)', borderTopColor: 'transparent' }} /></div>}
        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16 animate-fade-up">
            <p className="text-lg font-bold uppercase tracking-wide mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--heading)' }}>No matches</p>
            <p className="text-sm" style={{ color: 'var(--sub)' }}>Try different words or browse the main feed.</p>
          </div>
        )}
        {!loading && results.length > 0 && (
          <>
            <p className="text-xs mb-4" style={{ color: 'var(--sub)' }}>{results.length} {results.length === 1 ? 'result' : 'results'}</p>
            <div className="space-y-3 stagger-children">{results.map((post, i) => <PostCard key={post.id} post={post} index={i} />)}</div>
          </>
        )}
        {!searched && <div className="text-center py-16 animate-fade-up"><p className="text-base italic" style={{ fontFamily: 'var(--font-serif)', color: 'var(--sub)' }}>Search for needs, offers, or people</p></div>}
      </div>
    </>
  );
}
