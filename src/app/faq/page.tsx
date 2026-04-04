import { Header } from '@/components/header';
import Link from 'next/link';
import { APP_NAME, APP_COMMUNITY, APP_SMS_NUMBER } from '@/lib/constants';

export const metadata = {
  title: 'FAQ — Flourish',
  description: 'Frequently asked questions about Flourish, a free community exchange board.',
};

const faqs: { q: string; a: string | string[] }[] = [
  {
    q: `What is ${APP_NAME}?`,
    a: `${APP_NAME} is a free community exchange board for ${APP_COMMUNITY}. People post what they need and what they can offer — items, services, skills, space — and connect with each other. No money, no selling, no algorithms. Just neighbours helping neighbours.`,
  },
  {
    q: 'Is this a timebank?',
    a: 'No. Timebanks track hours and create obligations. Flourish has no tracking, no credits, no ledger. If you can help, you help. If you need something, you ask. There is no expectation of reciprocity on any individual exchange — though the idea is that when everyone offers what they can, the community as a whole flourishes.',
  },
  {
    q: 'Do I have to give something back?',
    a: 'No. There is no obligation to reciprocate. Post a need even if you have nothing to offer right now. The whole point is that help flows where it is needed.',
  },
  {
    q: 'Who runs this?',
    a: `${APP_NAME} is run by volunteers in ${APP_COMMUNITY}. It is open source and community-governed. There is no company behind it, no investors, no ads.`,
  },
  {
    q: 'Is it really free?',
    a: 'Yes. Free to use, free to post, free to respond. There are no hidden costs, no premium tiers, no data selling. The code is open source under the MIT license.',
  },
  {
    q: 'How do I post something?',
    a: [
      'Sign in with your email (we send you a magic link — no password needed).',
      'Click "Post something" and choose whether you have a need or an offer.',
      'Add a title, some details, and pick a category.',
      'Your post goes live and neighbours can respond.',
    ],
  },
  {
    q: 'Can I post via text message?',
    a: APP_SMS_NUMBER
      ? `Yes! Text ${APP_SMS_NUMBER} and say "hello" to get started. You can post needs and offers via SMS in any language.`
      : 'SMS posting may be available in the future. For now, use the website.',
  },
  {
    q: 'Is my information private?',
    a: 'Yes. Your email is only used for login and notifications. Your personal information is never shared publicly. When someone responds to your post, you connect through the app — you choose what to share and when.',
  },
  {
    q: 'What happens when my post expires?',
    a: 'Posts automatically expire after 30 days to keep the board fresh. You can mark a post as fulfilled anytime, or let it expire naturally. You can always post again.',
  },
  {
    q: 'What if someone behaves badly?',
    a: `All members agree to our code of conduct. Posts are reviewed by community moderators. If you see something concerning, use the feedback form or contact the moderation team. We take community safety seriously.`,
  },
  {
    q: 'Can I use this for my own community?',
    a: [
      'Absolutely. Flourish is open source and designed to be forked.',
      'Check out the code on GitHub, set it up for your neighbourhood, and customise it however you like.',
    ],
  },
  {
    q: 'How is this different from Facebook groups or Buy Nothing?',
    a: 'Flourish is not owned by any corporation. There is no algorithm deciding what you see, no ads, no data collection. Posts are shown chronologically and equally. It is built specifically for mutual aid — not marketplace transactions — and it is governed by the community that uses it.',
  },
];

export default function FAQPage() {
  return (
    <main className="page-bg min-h-screen">
      <Header />

      <div className="max-w-2xl mx-auto px-5 py-14">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="nav-link text-xs font-bold uppercase tracking-widest mb-3">
            Common questions
          </p>
          <h1 className="display-heading text-4xl sm:text-5xl font-extrabold uppercase tracking-wide leading-none mb-4">
            FAQ
          </h1>
          <p className="page-subtitle text-lg leading-relaxed">
            Everything you need to know about {APP_NAME}.
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="about-card p-6 relative"
            >
              <h2
                className="text-sm font-bold mb-3"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)', letterSpacing: '0.02em' }}
              >
                {faq.q}
              </h2>
              {Array.isArray(faq.a) ? (
                <ol className="space-y-2">
                  {faq.a.map((line, j) => (
                    <li key={j} className="flex gap-3 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-light)' }}>
                      <span className="flex-shrink-0 text-xs font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)', minWidth: '1.25rem' }}>
                        {String(j + 1).padStart(2, '0')}
                      </span>
                      {line}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-light)' }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-sm" style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-muted)' }}>
            Still have questions?
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/feedback" className="cta-btn inline-block px-8 py-3 text-xs font-bold uppercase tracking-wider transition-colors">
              Send feedback
            </Link>
            <Link href="/" className="cta-link text-xs font-bold uppercase tracking-wider">
              ← Back to board
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
