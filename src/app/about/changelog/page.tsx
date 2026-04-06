import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Changelog — Flourish' };

const changelog = [
  {
    date: '2026-04-06',
    changes: [
      {
        type: 'feature',
        title: 'Up to 10 photos per post',
        desc: 'You can now add up to 10 photos when creating or editing a post. Images are resized automatically to keep them fast and small.',
      },
      {
        type: 'feature',
        title: 'Archive posts instead of deleting',
        desc: 'Posts can now be archived instead of deleted. Archived posts are hidden from the main feed. Useful for duplicates, resolved requests, or expired posts.',
      },
      {
        type: 'fix',
        title: 'Vouch prompt only shows to non-posters',
        desc: 'The "You need a vouch to respond" message no longer appears on your own posts. It only shows when you\'re trying to respond to someone else\'s post.',
      },
      {
        type: 'feature',
        title: 'Photo gallery on post detail',
        desc: 'All photos on a post are now shown on the detail page, not just one. Post cards show the first photo with a count if there are more.',
      },
      {
        type: 'feature',
        title: 'Mobile home screen prompt',
        desc: 'On mobile devices, visitors will occasionally see a prompt to add Flourish to their home screen. It\'s shown periodically and easy to dismiss.',
      },
    ],
  },
];

export default async function ChangelogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      {/* Nav */}
      <div className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-4">
          <Link
            href="/about"
            className="text-xs font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
            style={{ color: 'var(--sub)', fontFamily: 'var(--font-display)' }}
          >
            ← Back
          </Link>
          <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>|</span>
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--sub)', fontFamily: 'var(--font-display)' }}
          >
            Changelog
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-10">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}
        >
          Changelog
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--ink-muted)' }}>
          What&apos;s new in Flourish. Updated as features are added.
        </p>

        {changelog.map((entry) => (
          <section key={entry.date} className="mb-10">
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b"
              style={{ color: 'var(--sub)', borderColor: 'var(--border)', fontFamily: 'var(--font-display)' }}
            >
              {new Date(entry.date).toLocaleDateString('en-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h2>
            <ul className="space-y-4">
              {entry.changes.map((change, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="flex-shrink-0 w-2 h-2 rounded-full mt-2"
                    style={{
                      background: change.type === 'feature' ? 'var(--offer)' : 'var(--sub)',
                    }}
                  />
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
                      {change.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                      {change.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {changelog.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
            No changes logged yet. Check back soon.
          </p>
        )}
      </div>
    </main>
  );
}
