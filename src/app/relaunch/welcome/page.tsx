import { MockShell, BigButton, Card, Chip, MarketBanner, NEIGHBOURHOODS, C } from '../mock-ui';

export const metadata = { title: 'Welcome mockup | Flourish', robots: { index: false } };

export default function WelcomeMock() {
  return (
    <MockShell title="welcome + neighbourhood">
      <section className="pt-6 pb-6">
        <p className="text-sm font-semibold" style={{ color: C.sun }}>Hi neighbour 👋</p>
        <h1 className="font-display font-extrabold text-[2.4rem] leading-[1.05] mt-2">
          Give what you&apos;ve got.<br />Ask for what you need.
        </h1>
        <p className="mt-3 text-base opacity-85 leading-relaxed">
          A gift board for London, from the folks behind the Really Really Free Market. No money, no selling, no algorithm. Just neighbours.
        </p>
      </section>

      <section className="mb-6">
        <p className="font-display font-bold mb-3">Where are you, roughly?</p>
        <div className="flex flex-wrap gap-2">
          {NEIGHBOURHOODS.slice(0, 9).map((n, i) => <Chip key={n} active={i === 0}>{n}</Chip>)}
          <Chip>Somewhere else</Chip>
        </div>
        <p className="text-xs mt-2 opacity-70">Just the neighbourhood. We never show your address.</p>
      </section>

      <div className="space-y-3 mb-6">
        <BigButton tone="offer" href="/relaunch/first-gift">🎁 I have something to give</BigButton>
        <BigButton tone="cream">🙋 I&apos;m looking for something</BigButton>
        <a className="block text-center text-sm underline opacity-80 py-2" href="/">Just looking around</a>
      </div>

      <Card className="mb-6">
        <p className="font-display font-bold text-lg mb-3">How gifting works here</p>
        <ol className="space-y-3">
          {[
            ['📸', 'Post it', 'A photo and a line. Done in under a minute.'],
            ['💌', 'Pick someone', 'Neighbours say they’re interested. You choose, no first-come rush.'],
            ['🏡', 'Porch pickup', 'Leave it out, message a time. No need to meet if you’d rather not.'],
            ['🙏', 'Say thanks', 'A quick thank-you post keeps the good stuff flowing.'],
          ].map(([e, t, d]) => (
            <li key={t} className="flex gap-3 items-start">
              <span className="text-2xl w-9 h-9 flex items-center justify-center rounded-2xl" style={{ background: '#ece4cf' }}>{e}</span>
              <span><b>{t}.</b> <span style={{ color: C.muted }}>{d}</span></span>
            </li>
          ))}
        </ol>
      </Card>

      <MarketBanner />

      <Card className="mt-6">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.need }}>This week in Old East Village</p>
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          {[['14', 'gifts given'], ['6', 'wishes granted'], ['23', 'thank-yous']].map(([n, l]) => (
            <div key={l} className="rounded-2xl py-3" style={{ background: '#ece4cf' }}>
              <p className="font-display font-extrabold text-2xl">{n}</p>
              <p className="text-xs" style={{ color: C.muted }}>{l}</p>
            </div>
          ))}
        </div>
      </Card>
    </MockShell>
  );
}
