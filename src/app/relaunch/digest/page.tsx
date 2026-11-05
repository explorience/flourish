import { MockShell, C } from '../mock-ui';

export const metadata = { title: 'Weekly digest mockup | Flourish', robots: { index: false } };

const GIFTS = [['🧥', 'Kids winter coat, size 6', 'Maya · Dundas & Adelaide'], ['🎲', 'Box of board games', 'Jo · Dundas & Rectory'], ['🎃', 'Extra squash from the garden', 'Sam · Wellington & Horton']];
const WISHES = [['🪜', 'Borrow a ladder for a Saturday', 'Dev · Wortley Village'], ['🚲', 'Someone to fix a bike chain', 'Maya · Old East Village']];

function Row({ e, t, s }: { e: string; t: string; s: string }) {
  return (
    <tr>
      <td style={{ padding: '10px 0', width: 48, fontSize: 28, verticalAlign: 'top' }}>{e}</td>
      <td style={{ padding: '10px 0', borderBottom: `1px solid ${C.line}` }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{t}</div>
        <div style={{ fontSize: 13, color: C.muted }}>{s}</div>
      </td>
    </tr>
  );
}

export default function DigestMock() {
  return (
    <MockShell title="weekly digest email (Sunday morning)">
      <p className="text-xs opacity-75 mt-3 mb-2">Subject: <b>3 gifts and 2 wishes near Old East Village this week</b></p>
      {/* Email body: table layout and inline styles so it survives email clients */}
      <div className="rounded-3xl overflow-hidden" style={{ background: C.card, color: C.ink, fontFamily: 'Georgia, serif' }}>
        <div style={{ background: C.offer, color: C.card, padding: '24px 24px 20px' }}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.85 }}>Flourish · Week of 9 Nov</div>
          <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginTop: 6 }}>Good morning, Old East Village ☀️</div>
          <div style={{ fontSize: 15, marginTop: 8, opacity: 0.9 }}>11 gifts changed hands near you this week. Here&apos;s what&apos;s up for grabs.</div>
        </div>
        <div style={{ padding: '8px 24px 24px' }}>
          <h2 style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.offer, margin: '18px 0 4px' }}>New gifts</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>{GIFTS.map(([e, t, s]) => <Row key={t} e={e} t={t} s={s} />)}</tbody></table>
          <h2 style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.need, margin: '22px 0 4px' }}>Wishes you might grant</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>{WISHES.map(([e, t, s]) => <Row key={t} e={e} t={t} s={s} />)}</tbody></table>
          <div style={{ background: '#ece4cf', borderRadius: 18, padding: 16, marginTop: 22 }}>
            <div style={{ fontSize: 15 }}>🙏 <b>Thank-you of the week:</b> “My daughter wore the coat to school the next morning and refused to take it off.” Priya to Maya</div>
          </div>
          <div style={{ background: C.sun, borderRadius: 18, padding: 16, marginTop: 14 }}>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Sat 28 Nov · Dilly Dally Café</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 4 }}>Really Really Free Market</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>Winter coats and boots especially welcome.</div>
          </div>
          <a style={{ display: 'block', textAlign: 'center', background: C.ink, color: C.card, borderRadius: 999, padding: '15px 20px', marginTop: 22, fontFamily: 'Arial, sans-serif', fontWeight: 700, textDecoration: 'none' }} href="#">See everything near you</a>
          <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: C.muted, textAlign: 'center', marginTop: 18, lineHeight: 1.5 }}>
            Once a week, Sunday morning. Change neighbourhood · Pause for a month · Unsubscribe in one tap
          </p>
        </div>
      </div>
    </MockShell>
  );
}
