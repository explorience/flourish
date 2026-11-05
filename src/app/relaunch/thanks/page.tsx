import { MockShell, BigButton, Card, C } from '../mock-ui';

export const metadata = { title: 'Gratitude wall mockup | Flourish', robots: { index: false } };

const THANKS = [
  { from: 'Priya', to: 'Maya', hood: 'Old East Village', what: 'kids winter coat', note: 'My daughter wore it to school the next morning and refused to take it off. Thank you!', emoji: '🧥', hearts: 18, tone: C.sun },
  { from: 'Dev', to: 'Sam', hood: 'Wortley Village', what: 'ladder for a Saturday', note: 'Gutters cleared before the first snow. Returned with cookies 🍪', emoji: '🪜', hearts: 11, tone: '#f3d9c9' },
  { from: 'Rosa', to: 'the Byron crew', hood: 'Byron', what: 'moving boxes', note: 'Fifteen boxes in two hours. This city is good.', emoji: '📦', hearts: 24, tone: '#d9e7d6' },
];

export default function ThanksMock() {
  return (
    <MockShell title="gratitude wall">
      <section className="pt-6 pb-5">
        <h1 className="font-display font-extrabold text-[2.1rem] leading-[1.08]">Thank-you wall 🙏</h1>
        <p className="mt-2 opacity-85">Every gift ends with a thanks. It&apos;s the best advert we&apos;ve got.</p>
      </section>

      <Card className="mb-5">
        <p className="font-display font-bold">You received <i>Snow shovel to borrow</i> from Dev</p>
        <div className="rounded-2xl px-4 py-3 mt-3 text-sm" style={{ background: '#ece4cf', color: C.muted }}>
          Say thanks to Dev… (they&apos;ll see it, and so will your neighbours)
        </div>
        <div className="flex gap-2 mt-3">
          {['❤️', '🙌', '🌱', '☕'].map((e) => <span key={e} className="w-11 h-11 flex items-center justify-center rounded-full text-xl" style={{ background: '#ece4cf' }}>{e}</span>)}
          <span className="flex-1" />
          <span className="rounded-full px-5 flex items-center font-bold text-sm" style={{ background: C.offer, color: C.card }}>Post thanks</span>
        </div>
      </Card>

      <div className="space-y-4 mb-6">
        {THANKS.map((t) => (
          <div key={t.from} className="rounded-3xl overflow-hidden" style={{ background: C.card, color: C.ink }}>
            <div className="h-28 flex items-center justify-center text-6xl" style={{ background: t.tone }}>{t.emoji}</div>
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.offer }}>{t.hood}</p>
              <p className="font-display font-bold text-lg mt-1 leading-snug">{t.from} → {t.to}</p>
              <p className="text-sm" style={{ color: C.muted }}>for the {t.what}</p>
              <p className="mt-2 leading-relaxed">“{t.note}”</p>
              <p className="text-sm mt-3" style={{ color: C.need }}>❤️ {t.hearts} neighbours smiled</p>
            </div>
          </div>
        ))}
      </div>
      <BigButton tone="sun">Give something, start a thank-you</BigButton>
    </MockShell>
  );
}
