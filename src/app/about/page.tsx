import { Header } from '@/components/header';
import Link from 'next/link';
import { APP_NAME, APP_TAGLINE, APP_COMMUNITY, APP_SMS_NUMBER } from '@/lib/constants';

export const metadata = {
  title: 'About — Flourish',
  description: 'A free community exchange board. Share what you have. Ask for what you need.',
};

export default function AboutPage() {
  return (
    <main className="page-bg min-h-screen">
      <Header />

      <div className="max-w-2xl mx-auto px-5 py-14">

        {/* Hero */}
        <div className="mb-12 text-center">
          <p className="nav-link text-xs font-bold uppercase tracking-widest mb-3">
            {APP_TAGLINE}
          </p>
          <h1 className="display-heading text-5xl sm:text-6xl font-extrabold uppercase tracking-wide leading-none mb-4">
            About {APP_NAME}
          </h1>
          <p className="page-subtitle text-lg leading-relaxed">
            Share what you have. Ask for what you need.
          </p>
        </div>

        {/* What is Flourish */}
        <div className="about-card p-8 mb-6 relative">
          <div className="tape tape-offer" />
          <h2 className="card-heading-offer text-xs font-bold uppercase tracking-widest mb-4">
            What is Flourish?
          </h2>
          <p className="card-body text-base leading-relaxed mb-4">
            {APP_NAME} is a free community exchange board for {APP_COMMUNITY}. It&apos;s a place where neighbours can share what they have and ask for what they need — items, services, skills, space, and more.
          </p>
          <p className="card-body-light text-base leading-relaxed">
            There&apos;s no algorithm, no ads, no selling. Just people helping each other out.
          </p>
        </div>

        {/* How it works */}
        <div className="about-card about-card-tilt-left p-8 mb-6 relative">
          <div className="tape tape-need" />
          <h2 className="card-heading-need text-xs font-bold uppercase tracking-widest mb-5">
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
                body: APP_SMS_NUMBER
                  ? `Sign in with a magic link — just your email, no password. Or text ${APP_SMS_NUMBER} to post via SMS. Just text "hello" to get started. You can use any language.`
                  : 'Sign in with a magic link — just your email, no password.',
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
                <div className="card-step-num flex-shrink-0 text-xl font-extrabold leading-none pt-0.5">
                  {item.step}
                </div>
                <div>
                  <h3 className="card-step-title text-sm font-bold uppercase tracking-wide mb-1">
                    {item.heading}
                  </h3>
                  <p className="card-body-light text-base leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="about-card about-card-tilt-right p-8 mb-6 relative">
          <div className="tape tape-offer" style={{ left: '35%' }} />
          <h2 className="card-heading-sub text-xs font-bold uppercase tracking-widest mb-5">
            What can be posted
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Items', desc: 'Tools, clothes, furniture, food, books — anything physical' },
              { label: 'Services', desc: 'Help with tasks, rides, childcare, repairs, delivery' },
              { label: 'Skills', desc: 'Teaching, coaching, translation, creative work, advice' },
              { label: 'Space', desc: 'Storage, workspace, garden plots, meeting rooms' },
            ].map((cat) => (
              <div key={cat.label} className="card-cat-border p-4">
                <div className="card-cat-label text-sm font-bold uppercase tracking-widest mb-1">
                  {cat.label}
                </div>
                <p className="card-body-muted text-base leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy + Access */}
        <div className="about-card about-card-tilt-neg p-8 mb-6 relative">
          <div className="tape tape-need" style={{ left: '45%' }} />
          <h2 className="card-heading-sub text-xs font-bold uppercase tracking-widest mb-4">
            Privacy &amp; access
          </h2>
          <ul className="space-y-2">
            {[
              'No account needed to browse',
              'Magic link login — just your email, no passwords',
              ...(APP_SMS_NUMBER ? [`You can also post by texting ${APP_SMS_NUMBER} — just say "hello" to start, in any language`] : []),
              'Your personal information is never shared',
              'We don\'t sell data or show you ads — ever',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="check-icon">✓</span>
                <p className="card-body-light text-base leading-relaxed">{item}</p>
              </li>
            ))}
            <li className="flex items-start gap-2">
              <span className="check-icon">✓</span>
              <p className="card-body-light text-base leading-relaxed">
                All members agree to our{' '}
                <a href="/code-of-conduct" className="link-offer">code of conduct</a>
              </p>
            </li>
          </ul>
        </div>

        {/* Open source */}
        <div className="about-card about-card-tilt-slight p-8 mb-10 relative">
          <div className="tape tape-offer" style={{ left: '30%' }} />
          <h2 className="card-heading-sub text-xs font-bold uppercase tracking-widest mb-4">
            Open source &amp; community-run
          </h2>
          <p className="card-body-light text-base leading-relaxed mb-3">
            Flourish is built in the open and licensed under the MIT license. Anyone can{' '}
            <a href="https://github.com/explorience/flourish" target="_blank" rel="noopener noreferrer" className="link-offer">inspect the code</a>, suggest improvements, or run their own instance for their community.
          </p>
          <p className="card-body-light text-base leading-relaxed">
            It&apos;s run by volunteers who believe local communities work better when people can share resources and support each other.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <Link href="/" className="cta-btn inline-block px-10 py-4 text-sm font-bold uppercase tracking-wider transition-colors">
            Browse the board
          </Link>
          <div className="flex items-center justify-center gap-4">
            <Link href="/code-of-conduct" className="cta-link text-xs font-bold uppercase tracking-wider">
              Code of conduct →
            </Link>
            <Link href="/feedback" className="cta-link text-xs font-bold uppercase tracking-wider">
              Send feedback →
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
