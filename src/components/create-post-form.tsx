'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CATEGORIES, URGENCIES } from '@/lib/constants';
import type { PostType, Category, Urgency, ContactMethod } from '@/types/database';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreatePostFormProps {
  onClose: () => void;
}

export function CreatePostForm({ onClose }: CreatePostFormProps) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<PostType | null>(null);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [urgency, setUrgency] = useState<Urgency>('flexible');
  const [contactName, setContactName] = useState('');
  const contactMethod: ContactMethod = 'app';
  const [crossStreet, setCrossStreet] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!type || !title.trim() || !contactName.trim()) return;
    setSubmitting(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Use API route so geocoding runs server-side
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        title: title.trim(),
        details: details.trim() || null,
        category,
        urgency,
        contact_name: contactName.trim(),
        contact_method: contactMethod,
        contact_value: null,
        source: 'web',
        user_id: user?.id || null,
        location_label: crossStreet.trim() || null,
        location_crossstreet: crossStreet.trim() || null,
      }),
    });

    if (res.ok) {
      setSubmitted(true);
      // Confetti burst — earthy greens and oranges to match the palette
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d07040', '#3a6a4a', '#e8e0c8', '#6aaa7a', '#f0ece0'],
        disableForReducedMotion: true,
      });
      setTimeout(onClose, 2500);
    }
    setSubmitting(false);
  };

  const ds = { fontFamily: 'var(--font-display)' };
  const sr = { fontFamily: 'var(--font-serif)' };

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 animate-fade-in" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up sm:rounded-md" style={{ background: 'var(--card)' }} onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="text-center py-20 px-6">
            <p className="text-xl font-bold uppercase tracking-wide mb-3" style={{ ...ds, color: 'var(--ink)' }}>Shared with the community</p>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>Your {type} is now live on the board.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div className="flex items-center gap-3">
                {step > 1 && <button onClick={() => setStep(step - 1)} className="p-1" style={{ color: 'var(--ink-muted)' }}><ArrowLeft className="w-4 h-4" /></button>}
                <div>
                  <p className="text-xs" style={{ color: 'var(--ink-muted)', fontSize: '0.6rem', ...ds }}>Step {step} of 3</p>
                  <p className="text-sm font-bold uppercase tracking-wide" style={{ ...ds, color: 'var(--ink)' }}>
                    {step === 1 && 'What kind of post?'}
                    {step === 2 && (type === 'need' ? 'What do you need?' : 'What can you offer?')}
                    {step === 3 && 'About you'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2" style={{ color: 'var(--ink-muted)' }}><X className="w-5 h-5" /></button>
            </div>

            {/* Progress */}
            <div className="px-6 pb-4 flex gap-1.5">
              {[1,2,3].map((s) => (
                <div key={s} className="h-1 flex-1" style={{ background: s <= step ? 'var(--ink)' : 'var(--border-card)' }} />
              ))}
            </div>

            <div className="px-6 pb-8">
              {step === 1 && (
                <div className="space-y-3 animate-fade-up">
                  {[
                    { val: 'need' as PostType, label: 'I need something', desc: 'A ride, a tool, some advice, a helping hand' },
                    { val: 'offer' as PostType, label: 'I can offer something', desc: 'Spare clothes, a skill, your time, extra space' },
                  ].map((opt) => (
                    <button key={opt.val} onClick={() => { setType(opt.val); setStep(2); }}
                      className="w-full p-5 text-left transition-all"
                      style={{
                        border: `2px solid ${type === opt.val ? (opt.val === 'need' ? 'var(--need)' : 'var(--offer)') : 'var(--border-card)'}`,
                        background: type === opt.val ? '#fff' : 'transparent',
                      }}
                    >
                      <p className="text-sm font-bold uppercase tracking-wide" style={{ ...ds, color: 'var(--ink)' }}>{opt.label}</p>
                      <p className="text-xs mt-1" style={{ ...sr, color: 'var(--ink-muted)', fontStyle: 'italic' }}>{opt.desc}</p>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-fade-up">
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-0 py-3 bg-transparent border-0 border-b-2 focus:outline-none text-lg"
                    style={{ borderColor: 'var(--border-card)', color: 'var(--ink)', ...sr }}
                    placeholder={type === 'need' ? 'Ride to appointment Tuesday' : 'Winter coats, kids sizes'}
                    autoFocus
                  />
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ ...ds, color: 'var(--ink-light)', fontSize: '0.6rem' }}>Details <span className="normal-case tracking-normal font-normal" style={{ color: 'var(--ink-muted)' }}>(optional)</span></label>
                    <textarea value={details} onChange={(e) => setDetails(e.target.value)}
                      className="w-full px-4 py-3 text-sm focus:outline-none resize-none"
                      style={{ background: '#fff', border: '1px solid var(--border-card)', color: 'var(--ink)' }}
                      rows={3} placeholder="Any extra context..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ ...ds, color: 'var(--ink-light)', fontSize: '0.6rem' }}>Category</label>
                    <div className="flex gap-2 flex-wrap">
                      {CATEGORIES.map((c) => (
                        <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                          className="px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all"
                          style={{ ...ds, fontSize: '0.6rem', background: category === c.value ? 'var(--ink)' : 'transparent', color: category === c.value ? 'var(--card)' : 'var(--ink-light)', border: `1.5px solid ${category === c.value ? 'var(--ink)' : 'var(--border-card)'}` }}
                        >{c.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ ...ds, color: 'var(--ink-light)', fontSize: '0.6rem' }}>How soon?</label>
                    <div className="flex gap-2">
                      {URGENCIES.map((u) => (
                        <button key={u.value} type="button" onClick={() => setUrgency(u.value)}
                          className="flex-1 px-3 py-2 text-xs font-bold uppercase tracking-wider text-center transition-all"
                          style={{ ...ds, fontSize: '0.6rem', background: urgency === u.value ? 'var(--ink)' : 'transparent', color: urgency === u.value ? 'var(--card)' : 'var(--ink-light)', border: `1.5px solid ${urgency === u.value ? 'var(--ink)' : 'var(--border-card)'}` }}
                        >{u.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Location — cross-street only */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ ...ds, color: 'var(--ink-light)', fontSize: '0.6rem' }}>
                      Whereabouts? <span className="normal-case tracking-normal font-normal" style={{ color: 'var(--ink-muted)' }}>(optional — places a pin on the map)</span>
                    </label>
                    <p className="text-xs mb-2" style={{ color: 'var(--ink-muted)', fontSize: '0.68rem' }}>
                      Nearest cross-street or landmark. We never show your exact location — only an approximate area.
                    </p>
                    <input
                      type="text"
                      value={crossStreet}
                      onChange={(e) => setCrossStreet(e.target.value)}
                      className="w-full px-4 py-3 text-sm focus:outline-none"
                      style={{ background: '#fff', border: '1px solid var(--border-card)', color: 'var(--ink)' }}
                      placeholder="e.g. Dundas & Adelaide, or near Victoria Park"
                    />
                  </div>

                  <button onClick={() => setStep(3)} disabled={!title.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-all"
                    style={{ background: 'var(--ink)', color: 'var(--card)', ...ds }}
                  >Continue <ArrowRight className="w-4 h-4" /></button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 animate-fade-up">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ ...ds, color: 'var(--ink-light)', fontSize: '0.6rem' }}>Your name</label>
                    <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-4 py-3 text-sm focus:outline-none"
                      style={{ background: '#fff', border: '1px solid var(--border-card)', color: 'var(--ink)' }}
                      placeholder="First name" autoFocus
                    />
                  </div>
                  <div className="p-3" style={{ background: 'rgba(58,106,74,0.08)', border: '1px solid var(--border-card)' }}>
                    <p className="text-xs" style={{ ...ds, color: 'var(--ink-light)', fontSize: '0.6rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>How people connect with you</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)', fontSize: '0.75rem' }}>
                      Interested neighbours will reach out through the app. Your personal info stays private until you choose to share it.
                    </p>
                  </div>

                  {/* Preview */}
                  <div className="p-4" style={{ background: 'rgba(26,42,32,0.05)', border: '1px dashed var(--border-card)' }}>
                    <p className="text-xs uppercase tracking-wider font-bold mb-1" style={{ ...ds, color: 'var(--ink-muted)', fontSize: '0.55rem' }}>Preview</p>
                    <p className="text-sm" style={{ color: 'var(--ink)' }}>
                      <span className="font-bold" style={{ color: type === 'need' ? 'var(--need)' : 'var(--offer)' }}>
                        {type === 'need' ? 'Looking for' : 'Offering'}:
                      </span>{' '}{title || '...'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
                      by {contactName || '...'}
                      {crossStreet && <span> · {crossStreet}</span>}
                    </p>
                  </div>

                  <button onClick={handleSubmit} disabled={submitting || !contactName.trim()}
                    className="w-full py-4 text-sm font-bold uppercase tracking-wider disabled:opacity-40 transition-all"
                    style={{ background: type === 'need' ? 'var(--need)' : 'var(--offer)', color: 'var(--card)', ...ds }}
                  >{submitting ? 'Posting...' : 'Share with the community'}</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
