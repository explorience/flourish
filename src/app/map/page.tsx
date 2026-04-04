import { createClient } from '@/lib/supabase/server';
import { MapClient } from './map-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function MapPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from('posts')
    .select('id, type, title, details, category, contact_name, created_at, status, location_label, location_crossstreet, location_fuzzed_lat, location_fuzzed_lng')
    .eq('status', 'active')
    .or('moderation_status.eq.approved,moderation_status.is.null')
    .not('location_fuzzed_lat', 'is', null)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen flex flex-col bg-page">
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(26,42,32,0.9)', borderColor: 'var(--border)' }}>
        <div className="max-w-xl mx-auto px-5 flex items-center justify-between" style={{ height: '3.25rem' }}>
          <Link href="/" className="inline-flex items-center gap-2 text-xs color-sub">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-xs font-bold uppercase tracking-widest font-display color-heading">
            Map view
          </span>
          <span className="text-xs color-sub">{posts?.length || 0} posts</span>
        </div>
      </header>

      <MapClient posts={posts || []} />
    </main>
  );
}
