import { createClient } from '@/lib/supabase/server';
import { MapClient } from './map-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function MapPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from('posts')
    .select('id, type, title, details, category, contact_name, created_at, status, location_label, location_fuzzed_lat, location_fuzzed_lng')
    .eq('status', 'active')
    .not('location_fuzzed_lat', 'is', null)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(26,42,32,0.9)', borderColor: 'var(--border)' }}>
        <div className="max-w-xl mx-auto px-5 h-39 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs" style={{ color: 'var(--sub)' }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--heading)', fontFamily: 'var(--font-display)' }}>
            Map view
          </span>
          <span className="text-xs" style={{ color: 'var(--sub)' }}>{posts?.length || 0} posts</span>
        </div>
      </header>

      <MapClient posts={posts || []} />
    </main>
  );
}
