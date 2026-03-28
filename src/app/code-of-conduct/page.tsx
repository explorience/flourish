import { Header } from '@/components/header';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export const metadata = {
  title: 'Code of Conduct — Flourish',
  description: 'Community guidelines for Flourish, London Ontario\'s community exchange board. Solidarity, respect, and mutual aid.',
};

export default function CodeOfConductPage() {
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
            Community guidelines
          </p>
          <h1
            className="text-5xl sm:text-6xl font-extrabold uppercase tracking-wide leading-none mb-4"
            style={{ ...ds, color: 'var(--heading)' }}
          >
            Code of Conduct
          </h1>
          <p
            className="text-lg leading-relaxed"
            style={{ ...sr, color: 'var(--sub)', fontStyle: 'italic' }}
          >
            How we show up for each other.
          </p>
        </div>

        {/* Intro */}
        <div
          className="p-8 mb-6 relative"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '2px 3px 12px rgba(0,0,0,0.2)' }}
        >
          <div className="tape tape-offer" />
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ ...ds, color: 'var(--offer)' }}
          >
            Our foundation
          </h2>
          <p
            className="text-base leading-relaxed mb-4"
            style={{ ...sr, color: 'var(--ink)' }}
          >
            {APP_NAME} is built on mutual aid — the idea that we are stronger when we support each other. These guidelines exist to keep this space safe, respectful, and welcoming for everyone.
          </p>
          <p
            className="text-base leading-relaxed italic"
            style={{ ...sr, color: 'var(--ink-light)' }}
          >
            &ldquo;Solidarity, not charity. Asking is as important as giving.&rdquo; — Dean Spade
          </p>
        </div>

        {/* Principles */}
        <div
          className="p-8 mb-6 relative"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '2px 3px 12px rgba(0,0,0,0.2)', transform: 'rotate(-0.4deg)' }}
        >
          <div className="tape tape-need" />
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-5"
            style={{ ...ds, color: 'var(--need)' }}
          >
            Our principles
          </h2>
          <div className="space-y-5">
            {[
              {
                title: 'Solidarity, not charity',
                body: 'We give and receive as equals. Asking for help is not a weakness — it\'s how communities work. No one here is above or below anyone else.',
              },
              {
                title: 'Respect and kindness',
                body: 'We lift each other up. We operate from a place of solidarity and tolerance for all. We know that people have different needs and circumstances, and we meet them where they are — without judgement.',
              },
              {
                title: 'Open and honest communication',
                body: 'We let people know if we can\'t show up or are running late. We\'re honest when a day or time doesn\'t work. We understand that plans change depending on people\'s circumstances.',
              },
              {
                title: 'Assume the best',
                body: 'Be charitable towards each other. Assume good intentions. We all could be doing a lot of other things — the fact that we\'re here means we share common ground.',
              },
              {
                title: 'Everyone contributes differently',
                body: 'Some of us can give money, some clothing, some food, some rides, some time, some art, some advice. What we can give may be different, but it\'s all valued and needed.',
              },
              {
                title: 'Always learning',
                body: 'We are open to learning and becoming better members of our communities. We learn from our mistakes and make amends when we cause harm.',
              },
            ].map((item) => (
              <div key={item.title}>
                <h3
                  className="text-sm font-bold uppercase tracking-wide mb-1"
                  style={{ ...ds, color: 'var(--ink)' }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-base leading-relaxed"
                  style={{ ...sr, color: 'var(--ink-light)' }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* What's not okay */}
        <div
          className="p-8 mb-6 relative"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '2px 3px 12px rgba(0,0,0,0.2)', transform: 'rotate(0.3deg)' }}
        >
          <div className="tape tape-offer" style={{ left: '35%' }} />
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-5"
            style={{ ...ds, color: 'var(--sub)' }}
          >
            What&apos;s not okay
          </h2>
          <ul className="space-y-2">
            {[
              'Hate speech, discrimination, or harassment of any kind',
              'Rudeness or shaming towards people who post frequently or ask for help often',
              'Commercial activity, advertising, or selling',
              'Sharing other people\'s personal information',
              'Posting anything illegal or unsafe',
              'Using this space to recruit for political campaigns, MLMs, or religious proselytizing',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span style={{ color: 'var(--need)', flexShrink: 0, marginTop: '2px' }}>✗</span>
                <p className="text-base leading-relaxed" style={{ ...sr, color: 'var(--ink-light)' }}>{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* When someone needs more help */}
        <div
          className="p-8 mb-6 relative"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '2px 3px 12px rgba(0,0,0,0.2)', transform: 'rotate(-0.2deg)' }}
        >
          <div className="tape tape-need" style={{ left: '45%' }} />
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ ...ds, color: 'var(--need)' }}
          >
            When someone needs more support
          </h2>
          <p
            className="text-base leading-relaxed"
            style={{ ...sr, color: 'var(--ink-light)' }}
          >
            If someone is asking for essential items repeatedly, we reach out with care — not judgement. We connect them with resources that can help long-term, like{' '}
            <a href="https://www.informationlondon.ca" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--offer)', textDecoration: 'underline' }}>Information London</a>,{' '}
            the London Food Bank, LifeSPIN, or other community services. Mutual aid is a bridge, not a replacement for systemic support.
          </p>
        </div>

        {/* Moderation */}
        <div
          className="p-8 mb-6 relative"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '2px 3px 12px rgba(0,0,0,0.2)', transform: 'rotate(0.2deg)' }}
        >
          <div className="tape tape-offer" style={{ left: '30%' }} />
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ ...ds, color: 'var(--sub)' }}
          >
            Moderation
          </h2>
          <p
            className="text-base leading-relaxed mb-3"
            style={{ ...sr, color: 'var(--ink-light)' }}
          >
            {APP_NAME} is moderated by volunteers from the community. When someone violates these guidelines, we start with conversation and education. We believe in accountability and making amends.
          </p>
          <p
            className="text-base leading-relaxed"
            style={{ ...sr, color: 'var(--ink-light)' }}
          >
            Repeated violations or severe harm (hate speech, threats, harassment) may result in removal. We have no tolerance for intolerance.
          </p>
        </div>

        {/* Living document */}
        <div
          className="p-8 mb-10 relative"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '2px 3px 12px rgba(0,0,0,0.2)', transform: 'rotate(-0.15deg)' }}
        >
          <div className="tape tape-need" style={{ left: '40%' }} />
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ ...ds, color: 'var(--need)' }}
          >
            A living document
          </h2>
          <p
            className="text-base leading-relaxed"
            style={{ ...sr, color: 'var(--ink-light)' }}
          >
            This code of conduct was written collaboratively by the people building {APP_NAME}. It will grow and change as we do. If you have suggestions, we want to hear them.
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
