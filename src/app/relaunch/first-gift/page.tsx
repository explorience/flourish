import { MockShell, BigButton, Card, C } from '../mock-ui';

export const metadata = { title: 'First gift mockup | Flourish', robots: { index: false } };

const PROMPTS = [
  ['🧥', 'A winter coat or boots', 'Kids grow, closets fill. Someone needs it before the snow.'],
  ['🧸', 'Kids’ stuff', 'Toys, books, the baby gear in the basement.'],
  ['🥧', 'Holiday leftovers', 'Extra tourtière, cookies, a turkey that was too big.'],
  ['🔧', 'Lend a tool', 'Ladder, drill, snow blower for an hour.'],
  ['⏰', 'An hour of help', 'Shovelling, a ride, a resume read-through.'],
  ['📚', 'Books and puzzles', 'Winter is long. Pass them on.'],
];

export default function FirstGiftMock() {
  return (
    <MockShell title="first gift nudge">
      <section className="pt-6 pb-5">
        <p className="text-sm font-semibold" style={{ color: C.sun }}>You&apos;re in, Jo 🎉</p>
        <h1 className="font-display font-extrabold text-[2.1rem] leading-[1.08] mt-2">What could you give away this week?</h1>
        <p className="mt-3 opacity-85">Buy Nothing groups work because people give first. Tap one and we&apos;ll start the post for you.</p>
      </section>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {PROMPTS.map(([e, t, d], i) => (
          <div key={t} className="rounded-3xl p-4 min-h-[140px] flex flex-col"
            style={{ background: i === 0 ? C.sun : C.card, color: C.ink, outline: i === 0 ? `3px solid ${C.card}` : 'none' }}>
            <span className="text-3xl">{e}</span>
            <span className="font-display font-bold mt-2 leading-tight">{t}</span>
            <span className="text-xs mt-1 leading-snug" style={{ color: C.muted }}>{d}</span>
          </div>
        ))}
      </div>

      <Card className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.offer }}>Your post, started</p>
        <p className="font-display font-bold text-xl mt-2">Free: kids winter coat</p>
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-2xl px-4 py-3" style={{ background: '#ece4cf' }}>Size: <span style={{ color: C.muted }}>e.g. 6, fits 5 to 7</span></div>
          <div className="rounded-2xl px-4 py-3 flex items-center justify-between" style={{ background: '#ece4cf' }}>
            <span>📸 Add a photo</span><span className="text-xs" style={{ color: C.muted }}>location data removed</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['🏡 Porch pickup', '☕ Meet at Dilly Dally', '🛍 Bring to the Free Market'].map((x, i) => (
              <span key={x} className="rounded-full px-3 py-2 text-sm font-semibold" style={i === 0 ? { background: C.offer, color: C.card } : { border: `1.5px solid ${C.line}` }}>{x}</span>
            ))}
          </div>
        </div>
      </Card>
      <BigButton tone="offer">Post my first gift</BigButton>
      <p className="text-center text-sm mt-3 opacity-75">Not now. Show me what neighbours need instead →</p>
    </MockShell>
  );
}
