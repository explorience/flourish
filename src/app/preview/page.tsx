import { Header } from '@/components/header';

export const metadata = {
  title: 'Font Preview — Flourish',
  description: 'Compare body font candidates for the Flourish community exchange board.',
};

const SAMPLE_TEXT = `Flourish is a free community exchange board. Think of it as a neighbourhood bulletin board — but online, and available to anyone in the city. People post what they need or what they can offer, and neighbours connect with each other. No money changes hands. It's about sharing resources, skills, time, and space within our community.`;

const SAMPLE_SHORT = `"Ride to appointment Tuesday" · "Free kids clothes, ages 4-6" · "Can help with basic plumbing" · "Looking for a winter coat, size M"`;

const FONTS = [
  { name: 'Inter', className: 'font-preview-inter', desc: 'Clean, highly legible, designed for screens. The gold standard.' },
  { name: 'Source Sans 3', className: 'font-preview-source-sans', desc: "Adobe's open-source workhorse, slightly warmer than Inter." },
  { name: 'Nunito', className: 'font-preview-nunito', desc: 'Rounded, friendly, very readable. Good "community" feel.' },
  { name: 'Source Serif 4', className: 'font-preview-source-serif', desc: 'Thicker strokes than Libre Baskerville, better on dark backgrounds.' },
  { name: 'Merriweather', className: 'font-preview-merriweather', desc: 'Designed for screen readability, generous x-height.' },
];

export default function FontPreviewPage() {
  return (
    <main className="page-bg min-h-screen">
      <Header />

      <div className="max-w-3xl mx-auto px-5 py-14">
        <h1 className="display-heading text-2xl font-bold uppercase tracking-wide mb-2">
          Font Preview
        </h1>
        <p className="prose-dark-italic text-sm mb-10">
          Compare body font candidates on your current theme. Toggle themes using the sun icon in the header.
        </p>

        <div className="space-y-8">
          {FONTS.map((font) => (
            <div key={font.name} className="about-card p-6 relative">
              <div className="flex items-baseline justify-between mb-1">
                <h2 className="card-step-title text-sm font-bold uppercase tracking-wide">
                  {font.name}
                </h2>
                <span className="card-body-muted text-xs">{font.desc}</span>
              </div>
              <hr className="section-divider my-3" />
              <p className={`${font.className} text-base leading-relaxed card-body-light mb-4`}>
                {SAMPLE_TEXT}
              </p>
              <p className={`${font.className} text-sm leading-relaxed card-body-muted italic`}>
                {SAMPLE_SHORT}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="prose-dark text-sm">
            Current display heading font: <strong>Syne</strong> (used for all headings above)
          </p>
        </div>
      </div>
    </main>
  );
}
