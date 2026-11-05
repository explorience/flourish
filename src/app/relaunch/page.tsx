import Link from 'next/link';
import { MockShell, Card } from './mock-ui';

export const metadata = { title: 'Relaunch mockups | Flourish', robots: { index: false } };

const SCREENS = [
  { href: '/relaunch/welcome', title: 'Welcome + neighbourhood', why: 'First 10 seconds: what this is, that it is local, and how gifting works.' },
  { href: '/relaunch/first-gift', title: 'First gift nudge', why: 'One-tap prompts so a new neighbour gives before they ask.' },
  { href: '/relaunch/thanks', title: 'Gratitude wall', why: 'Thank-you posts make generosity visible and contagious.' },
  { href: '/relaunch/digest', title: 'Weekly digest email', why: 'Brings people back once a week without an app habit.' },
  { href: '/relaunch/poster', title: 'QR poster', why: 'For cafés, libraries and the Free Market on 28 Nov.' },
];

export default function RelaunchIndex() {
  return (
    <MockShell title="index">
      <h1 className="font-display font-extrabold text-3xl mt-4 mb-2">Relaunch mockups</h1>
      <p className="opacity-80 mb-6">Static screens for discussion. See RELAUNCH.md in the repo for the plan.</p>
      <div className="space-y-3">
        {SCREENS.map((s) => (
          <Link key={s.href} href={s.href} className="block">
            <Card>
              <p className="font-display font-bold text-lg">{s.title}</p>
              <p className="text-sm mt-1" style={{ color: '#5c6b5a' }}>{s.why}</p>
            </Card>
          </Link>
        ))}
      </div>
    </MockShell>
  );
}
