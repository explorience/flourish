import { MockShell, C } from '../mock-ui';

export const metadata = { title: 'QR poster mockup | Flourish', robots: { index: false } };

// Decorative stand-in for a QR code. Generate the real one for flourish.community/?src=poster-<location>.
function FakeQR() {
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21, y = Math.floor(i / 21);
    const finder = (a: number, b: number) => x >= a && x < a + 7 && y >= b && y < b + 7 && (x === a || x === a + 6 || y === b || y === b + 6 || (x >= a + 2 && x <= a + 4 && y >= b + 2 && y <= b + 4));
    if (finder(0, 0) || finder(14, 0) || finder(0, 14)) return true;
    if ((x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)) return false;
    return ((x * 7 + y * 13 + x * y) % 5) < 2;
  });
  return (
    <svg viewBox="0 0 21 21" className="w-40 h-40" shapeRendering="crispEdges" aria-label="QR code placeholder">
      <rect width="21" height="21" fill="#fff" />
      {cells.map((on, i) => on && <rect key={i} x={i % 21} y={Math.floor(i / 21)} width="1" height="1" fill={C.ink} />)}
    </svg>
  );
}

export default function PosterMock() {
  return (
    <MockShell title="QR poster (letter size, print in colour or B&W)">
      <div className="rounded-[28px] p-7 mt-4 relative overflow-hidden" style={{ background: C.card, color: C.ink }}>
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full" style={{ background: C.sun }} />
        <div className="absolute -left-12 bottom-24 w-32 h-32 rounded-full" style={{ background: '#f3d9c9' }} />
        <div className="relative">
          <p className="font-display font-extrabold text-sm tracking-wide">FLOURISH · LONDON, ON</p>
          <h1 className="font-display font-extrabold text-[2.6rem] leading-[1.0] mt-4">Got stuff?<br />Need stuff?<br /><span style={{ color: C.offer }}>Gift it.</span></h1>
          <p className="mt-4 text-base leading-snug max-w-[16rem]">Your neighbours are giving away coats, tools, toys, food and time. Free, always.</p>
          <div className="flex items-end gap-4 mt-6">
            <div className="rounded-2xl p-2 bg-white shadow-sm"><FakeQR /></div>
            <div className="pb-2">
              <p className="font-display font-bold text-lg leading-tight">Scan to see<br />what&apos;s near you</p>
              <p className="text-sm mt-1" style={{ color: C.muted }}>flourish.community</p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl px-4 py-3 text-sm font-semibold" style={{ background: C.ink, color: C.sun }}>
            First time? Come to the Really Really Free Market, Sat 28 Nov at Dilly Dally Café.
          </div>
        </div>
      </div>
      <p className="text-xs opacity-70 mt-3">QR above is a placeholder pattern. Use a per-location link (e.g. ?src=dillydally) so we can see which posters work.</p>
    </MockShell>
  );
}
