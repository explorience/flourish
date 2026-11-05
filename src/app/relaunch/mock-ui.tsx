// Shared bits for the relaunch mockups. Static data only: nothing here reads or writes the database.
import Link from 'next/link';

export const NEIGHBOURHOODS = [
  'Old East Village', 'Wortley Village', 'Old North', 'SoHo', 'Woodfield',
  'Blackfriars', 'Byron', 'Westmount', 'Argyle', 'Masonville', 'White Oaks', 'Northridge',
];

export const C = {
  bg: '#1a2a20',
  card: '#f6f1e4',
  ink: '#1a2a20',
  muted: '#5c6b5a',
  need: '#d07040',
  offer: '#3a6a4a',
  sun: '#f2c14e',
  line: '#e2d9c3',
};

export function MockShell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <main className="min-h-screen pb-16" style={{ background: C.bg, color: C.card }}>
      <div className="text-center text-[11px] font-bold py-1.5" style={{ background: C.sun, color: C.ink }}>
        Relaunch mockup: {title}. Static preview, not wired up yet.
      </div>
      <header className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/relaunch" className="font-display font-extrabold tracking-wide text-sm">Flourish</Link>
        <span className="text-xs opacity-80">London, Ontario</span>
      </header>
      <div className="max-w-xl mx-auto px-4">{children}</div>
    </main>
  );
}

export function BigButton({ children, tone = 'cream', href = '#' }: { children: React.ReactNode; tone?: 'cream' | 'offer' | 'need' | 'sun'; href?: string }) {
  const styles = {
    cream: { background: C.card, color: C.ink },
    offer: { background: C.offer, color: C.card },
    need: { background: C.need, color: '#fff' },
    sun: { background: C.sun, color: C.ink },
  }[tone];
  return (
    <a href={href} className="flex items-center justify-center w-full rounded-full font-display font-bold text-base min-h-[56px] px-6 shadow-sm active:scale-[0.98] transition-transform" style={styles}>
      {children}
    </a>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl p-5 ${className}`} style={{ background: C.card, color: C.ink }}>
      {children}
    </div>
  );
}

export function Chip({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span className="inline-flex items-center rounded-full px-4 min-h-[40px] text-sm font-semibold whitespace-nowrap"
      style={active ? { background: C.offer, color: C.card } : { background: 'rgba(246,241,228,0.1)', color: C.card, border: '1.5px solid rgba(246,241,228,0.25)' }}>
      {children}
    </span>
  );
}

export function MarketBanner() {
  return (
    <div className="rounded-3xl p-5 relative overflow-hidden" style={{ background: C.sun, color: C.ink }}>
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full" style={{ background: 'rgba(208,112,64,0.25)' }} />
      <p className="text-xs font-bold uppercase tracking-wider">Sat 28 Nov · Dilly Dally Café</p>
      <p className="font-display font-extrabold text-xl leading-tight mt-1">Really Really Free Market</p>
      <p className="text-sm mt-1.5 leading-snug">Bring what you don&apos;t need, take what you do. Can&apos;t make it? Post it here and we&apos;ll bring it along.</p>
      <div className="flex gap-2 mt-3">
        <span className="rounded-full px-4 py-2 text-sm font-bold" style={{ background: C.ink, color: C.sun }}>I&apos;ll be there</span>
        <span className="rounded-full px-4 py-2 text-sm font-bold" style={{ border: `1.5px solid ${C.ink}` }}>Add to calendar</span>
      </div>
    </div>
  );
}
