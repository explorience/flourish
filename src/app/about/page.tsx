import { Header } from '@/components/header';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export const metadata = {
  title: 'About — Flourish',
  description: 'A free community exchange board for London, Ontario. Share what you have. Ask for what you need.',
};

export default function AboutPage() {
  const ds: React.CSSProperties = { fontFamily: 'var(--font-display)' };
  const sr: React.CSSProperties = { fontFamily: 'var(--font-serif)' };

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Header />

      <div className="max-w-2xl mx-auto px-5 py-14">

        {/* Hero */}
        <div className="mb-12 text-center">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ ...ds, color: 'var(--sub)' }}
          >
            London, Ontario
          </p>
          <h1
            className="text-5xl sm:text-6xl font-extrabold uppercase tracking-wide leading-none mb-4"
            style={{ ...ds, color: 'var(--heading)' }}
          >
            About {APP_NAME}
          </h1>
          <p
            className="text-lg leading-relaxed"
            style={{ ...sr, color: 'var(--sub)', fontStyle: 'italic' }}
          >
            Share what you have. Ask for what you need.
          </p>
        </div>

        {/* What is Flourish */}
        <div
          className="p-8 mb-6 relative"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '2px 3px 12px rgba(0,0,0,0.2)' }}
        >
          <div className="tape tape-offer" />
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ ...ds, color: 'var(--offer)' }}
          >
            What is Flourish?
          </h2>
          <p
            className="text-base leading-relaxed mb-4"
            style={{ ...sr, color: 'var(--ink)' }}
          >
            Flourish is a free community exchange board for London, Ontario. It&apos;s a place where neighbours can share what they have and ask for what they need — items, services, skills, space, and more.
          </p>
          <p
            className="text-base leading-relaxed"
            style={{ ...sr, color: 'var(--ink-light)' }}
          >
            There&apos;s no algorithm, no ads, no selling. Just people helping each other out.
          </p>
        </div>

        {/* How it works */}
        <div
          className="p-8 mb-6 relative"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '2px 3px 12px rgba(0,0,0,0.2)', transform: 'rotate(-0.4deg)' }}
        >
          <div className="tape tape-need" />
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-5"
            style={{ ...ds, color: 'var(--need)' }}
          >
            How it works
          </h2>
          <div className="space-y-4">
            {[
              {
                step: '01',
                heading: 'Browse the board',
                body: 'No account needed. See what your neighbours have shared — needs and offers, big and small.',
              },
              {
                step: '02',
                heading: 'Post what you need or can offer',
                body: 'Sign in with a magic link — just your email, no password. Or text (226) 242-0489 to post via SMS. Just text "hello" to get started. You can use any language.',
              },
              {
                step: '03',
                heading: 'Connect privately',
                body: 'Respond to a post and connect through the app. Your personal information is never shared.',
              },
              {
                step: '04',
                heading: 'Posts expire in 30 days',
                body: 'The board stays fresh. Mark your post fulfilled when done, or let it expire naturally.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div
                  className="flex-shrink-0 text-xl font-extrabold leading-none pt-0.5"
                  style={{ ...ds, color: 'var(--border-card)', letterSpacing: '-0.02em' }}
                >
                  {item.step}
                </div>
                <div>
                  <h3
                    className="text-sm font-bold uppercase tracking-wide mb-1"
                    style={{ ...ds, color: 'var(--ink)' }}
                  >
                    {item.heading}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ ...sr, color: 'var(--ink-light)' }}
                  >
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div
          className="p-8 mb-6 relative"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '2px 3px 12px rgba(0,0,0,0.2)', transform: 'rotate(0.3deg)' }}
        >
          <div className="tape tape-offer" style={{ left: '35%' }} />
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-5"
            style={{ ...ds, color: 'var(--sub)' }}
          >
            What can be posted
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Items', desc: 'Tools, clothes, furniture, food, books — anything physical' },
              { label: 'Services', desc: 'Help with tasks, rides, childcare, repairs, delivery' },
              { label: 'Skills', desc: 'Teaching, coaching, translation, creative work, advice' },
              { label: 'Space', desc: 'Storage, workspace, garden plots, meeting rooms' },
            ].map((cat) => (
              <div
                key={cat.label}
                className="p-4"
                style={{ border: '1px dashed var(--border-card)' }}
              >
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-1"
                  style={{ ...ds, color: 'var(--ink)' }}
                >
                  {cat.label}
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ ...sr, color: 'var(--ink-muted)' }}
                >
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy + Access */}
        <div
          className="p-8 mb-6 relative"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '2px 3px 12px rgba(0,0,0,0.2)', transform: 'rotate(-0.2deg)' }}
        >
          <div className="tape tape-need" style={{ left: '45%' }} />
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ ...ds, color: 'var(--sub)' }}
          >
            Privacy &amp; access
          </h2>
          <ul className="space-y-2">
            {[
              'No account needed to browse',
              'Magic link login — just your email, no passwords',
              'You can also post by texting (226) 242-0489 — just say "hello" to start, in any language',
              'Your personal information is never shared',
              'We don\'t sell data or show you ads — ever',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span style={{ color: 'var(--offer)', flexShrink: 0, marginTop: '2px' }}>✓</span>
                <p className="text-sm leading-relaxed" style={{ ...sr, color: 'var(--ink-light)' }}>{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Open source */}
        <div
          className="p-8 mb-10 relative"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '2px 3px 12px rgba(0,0,0,0.2)', transform: 'rotate(0.2deg)' }}
        >
          <div className="tape tape-offer" style={{ left: '30%' }} />
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ ...ds, color: 'var(--sub)' }}
          >
            Open source &amp; community-run
          </h2>
          <p
            className="text-sm leading-relaxed mb-3"
            style={{ ...sr, color: 'var(--ink-light)' }}
          >
            Flourish is built in the open and licensed under the MIT license. Anyone can inspect the code, suggest improvements, or run their own instance for their community.
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ ...sr, color: 'var(--ink-light)' }}
          >
            It&apos;s run by volunteers who believe local communities work better when people can share resources and support each other.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <Link
            href="/"
            className="inline-block px-10 py-4 text-sm font-bold uppercase tracking-wider transition-colors"
            style={{ ...ds, background: 'var(--card)', color: 'var(--ink)' }}
          >
            Browse the board
          </Link>
          <div>
            <Link
              href="/feedback"
              className="text-xs font-bold uppercase tracking-wider"
              style={{ ...ds, color: 'var(--sub)' }}
            >
              Send feedback →
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
