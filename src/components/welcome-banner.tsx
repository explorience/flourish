'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { APP_NAME } from '@/lib/constants';
import Link from 'next/link';

const ds: React.CSSProperties = { fontFamily: 'var(--font-display)' };
const sr: React.CSSProperties = { fontFamily: 'var(--font-serif)' };

const DISMISSED_KEY = 'flourish_welcome_dismissed';

export function WelcomeBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show to non-logged-in users who haven't dismissed
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) setShow(true);
    });
  }, []);

  if (!show) return null;

  return (
    <section className="px-5 pb-6">
      <div className="max-w-2xl mx-auto">
        <div className="relative p-6" style={{ background: 'rgba(240,236,224,0.06)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => {
              setShow(false);
              localStorage.setItem(DISMISSED_KEY, 'true');
            }}
            className="absolute top-3 right-3 text-xs"
            style={{ color: 'var(--sub)' }}
          >
            ✕
          </button>

          <h2
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ ...ds, color: 'var(--sub)' }}
          >
            How it works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {[
              {
                num: '01',
                title: 'Browse',
                body: 'See what your neighbours need and what they can offer',
              },
              {
                num: '02',
                title: 'Post',
                body: 'Need something? Can offer something? Post it in seconds',
              },
              {
                num: '03',
                title: 'Connect',
                body: 'Respond to a post and connect privately - no money involved',
              },
            ].map((step) => (
              <div key={step.num}>
                <div
                  className="text-xl font-extrabold leading-none mb-1"
                  style={{ ...ds, color: 'var(--border)' }}
                >
                  {step.num}
                </div>
                <div
                  className="text-xs font-bold uppercase tracking-wide mb-1"
                  style={{ ...ds, color: 'var(--heading)' }}
                >
                  {step.title}
                </div>
                <p className="text-xs leading-relaxed" style={{ ...sr, color: 'var(--sub)' }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/about"
              className="text-xs font-bold uppercase tracking-wider"
              style={{ ...ds, color: 'var(--offer)', letterSpacing: '0.08em' }}
            >
              Learn more →
            </Link>
            <Link
              href="/code-of-conduct"
              className="text-xs font-bold uppercase tracking-wider"
              style={{ ...ds, color: 'var(--sub)', letterSpacing: '0.08em' }}
            >
              Code of conduct →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
