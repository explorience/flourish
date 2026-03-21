'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const LeafletMap = dynamic(() => import('./leaflet-map'), { ssr: false, loading: () => (
  <div className="flex-1 flex items-center justify-center" style={{ height: 'calc(100vh - 52px)' }}>
    <div className="text-sm" style={{ color: 'var(--sub)' }}>Loading map...</div>
  </div>
) });

interface MapPost {
  id: string;
  type: string;
  title: string;
  details: string | null;
  category: string;
  contact_name: string;
  created_at: string;
  status: string;
  location_label: string | null;
  location_fuzzed_lat: number;
  location_fuzzed_lng: number;
}

interface MapClientProps {
  posts: MapPost[];
}

export function MapClient({ posts }: MapClientProps) {
  const [selected, setSelected] = useState<MapPost | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'need' | 'offer'>('all');

  const filtered = posts.filter(p => (typeFilter === 'all' || p.type === typeFilter) && p.location_fuzzed_lat && p.location_fuzzed_lng);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 52px)' }}>
      {/* Filter strip */}
      <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        {(['all', 'need', 'offer'] as const).map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.6rem',
              background: typeFilter === t ? 'var(--card)' : 'transparent',
              color: typeFilter === t ? 'var(--ink)' : 'var(--sub)',
              border: `1.5px solid ${typeFilter === t ? 'var(--card)' : 'var(--border)'}`,
            }}>
            {t === 'all' ? `All (${posts.length})` : t === 'need' ? `Needs (${posts.filter(p => p.type === 'need').length})` : `Offers (${posts.filter(p => p.type === 'offer').length})`}
          </button>
        ))}
        {filtered.length === 0 && posts.length > 0 && (
          <span className="text-xs ml-2" style={{ color: 'var(--need)' }}>
            No posts with locations yet — add a neighbourhood when creating a post
          </span>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {filtered.length === 0 && posts.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-8">
              <p className="text-lg font-bold uppercase tracking-wide mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--heading)' }}>
                No located posts yet
              </p>
              <p className="text-sm italic mb-6"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--sub)' }}>
                Posts with a neighbourhood selected will appear here
              </p>
              <Link href="/" className="text-xs font-bold uppercase tracking-wider px-5 py-3 transition-all"
                style={{ fontFamily: 'var(--font-display)', background: 'var(--card)', color: 'var(--ink)' }}>
                Back to board
              </Link>
            </div>
          </div>
        ) : (
          <LeafletMap posts={filtered} selected={selected} onSelect={setSelected} />
        )}

        {/* Selected post card */}
        {selected && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] animate-slide-up"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', padding: '16px' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold uppercase tracking-wider mb-1"
                  style={{ fontFamily: 'var(--font-display)', color: selected.type === 'need' ? 'var(--need)' : 'var(--offer)', fontSize: '0.6rem' }}>
                  {selected.type} {selected.location_label ? `· ${selected.location_label}` : ''}
                </div>
                <h3 className="text-base leading-tight mb-1 truncate"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontWeight: 400 }}>
                  {selected.title}
                </h3>
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                  {selected.contact_name} · {formatDistanceToNow(new Date(selected.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Link href={`/post/${selected.id}`}
                  className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-center transition-all"
                  style={{ fontFamily: 'var(--font-display)', background: selected.type === 'need' ? 'var(--need)' : 'var(--offer)', color: 'var(--card)', fontSize: '0.6rem' }}>
                  View
                </Link>
                <button onClick={() => setSelected(null)}
                  className="px-3 py-2 text-xs uppercase tracking-wider"
                  style={{ border: '1px solid var(--border-card)', color: 'var(--ink-muted)', fontSize: '0.6rem' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
