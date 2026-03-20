'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CATEGORIES, URGENCIES } from '@/lib/constants';
import type { PostType, Category, Urgency, ContactMethod } from '@/types/database';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

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
  const [contactMethod, setContactMethod] = useState<ContactMethod>('app');
  const [contactValue, setContactValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!type || !title.trim() || !contactName.trim()) return;

    setSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase.from('posts').insert({
      type,
      title: title.trim(),
      details: details.trim() || null,
      category,
      urgency,
      contact_name: contactName.trim(),
      contact_method: contactMethod,
      contact_value: contactValue.trim() || null,
      source: 'web' as const,
    });

    if (!error) {
      setSubmitted(true);
      setTimeout(onClose, 2000);
    }
    setSubmitting(false);
  };

  const canAdvance = () => {
    if (step === 1) return type !== null;
    if (step === 2) return title.trim().length > 0;
    if (step === 3) return contactName.trim().length > 0;
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div
        className="bg-[hsl(39,50%,98%)] rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center py-20 px-6">
            <p className="text-3xl font-semibold text-[hsl(25,30%,18%)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Shared with your neighbours
            </p>
            <p className="text-[hsl(25,15%,50%)]">
              Your {type} is now visible to the community.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div className="flex items-center gap-3">
                {step > 1 && (
                  <button onClick={() => setStep(step - 1)} className="p-1.5 rounded-full hover:bg-[hsl(35,30%,90%)] text-[hsl(25,15%,45%)] transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <p className="text-xs text-[hsl(25,15%,55%)] font-medium">Step {step} of 3</p>
                  <p className="text-sm font-semibold text-[hsl(25,30%,20%)]">
                    {step === 1 && 'What kind of post?'}
                    {step === 2 && (type === 'need' ? 'What do you need?' : 'What can you offer?')}
                    {step === 3 && 'About you'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-[hsl(35,30%,90%)] text-[hsl(25,15%,50%)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-6 pb-4">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${
                    s <= step ? 'bg-[hsl(25,45%,35%)]' : 'bg-[hsl(35,20%,88%)]'
                  }`} />
                ))}
              </div>
            </div>

            <div className="px-6 pb-8">
              {/* Step 1: Type */}
              {step === 1 && (
                <div className="space-y-3 animate-fade-up">
                  <button
                    onClick={() => { setType('need'); setStep(2); }}
                    className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                      type === 'need'
                        ? 'border-[hsl(18,60%,52%)] bg-[hsl(18,50%,97%)]'
                        : 'border-[hsl(35,20%,88%)] hover:border-[hsl(18,40%,70%)] bg-white'
                    }`}
                  >
                    <p className="text-lg font-semibold text-[hsl(25,30%,18%)]" style={{ fontFamily: 'var(--font-display)' }}>
                      I need something
                    </p>
                    <p className="text-sm text-[hsl(25,15%,50%)] mt-1">
                      A ride, a tool, some advice, a helping hand
                    </p>
                  </button>

                  <button
                    onClick={() => { setType('offer'); setStep(2); }}
                    className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                      type === 'offer'
                        ? 'border-[hsl(145,30%,42%)] bg-[hsl(145,30%,97%)]'
                        : 'border-[hsl(35,20%,88%)] hover:border-[hsl(145,25%,65%)] bg-white'
                    }`}
                  >
                    <p className="text-lg font-semibold text-[hsl(25,30%,18%)]" style={{ fontFamily: 'var(--font-display)' }}>
                      I can offer something
                    </p>
                    <p className="text-sm text-[hsl(25,15%,50%)] mt-1">
                      Spare clothes, a skill, your time, extra space
                    </p>
                  </button>
                </div>
              )}

              {/* Step 2: Details */}
              {step === 2 && (
                <div className="space-y-5 animate-fade-up">
                  <div>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-[hsl(35,25%,85%)] focus:border-[hsl(25,45%,35%)] focus:outline-none text-xl text-[hsl(25,30%,18%)] placeholder:text-[hsl(25,15%,72%)] transition-colors"
                      style={{ fontFamily: 'var(--font-display)' }}
                      placeholder={type === 'need' ? 'Ride to appointment Tuesday' : 'Winter coats, kids sizes'}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[hsl(25,15%,50%)] uppercase tracking-wider mb-2">
                      Details (optional)
                    </label>
                    <textarea
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[hsl(35,20%,87%)] bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(25,45%,35%)]/20 focus:border-[hsl(25,45%,35%)] text-sm text-[hsl(25,20%,30%)] placeholder:text-[hsl(25,15%,72%)] resize-none transition-all"
                      rows={3}
                      placeholder="Any extra context that would help..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[hsl(25,15%,50%)] uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setCategory(c.value)}
                          className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                            category === c.value
                              ? 'bg-[hsl(25,45%,30%)] text-white'
                              : 'bg-white text-[hsl(25,20%,40%)] border border-[hsl(35,20%,87%)] hover:border-[hsl(35,25%,75%)]'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[hsl(25,15%,50%)] uppercase tracking-wider mb-2">
                      How soon?
                    </label>
                    <div className="flex gap-2">
                      {URGENCIES.map((u) => (
                        <button
                          key={u.value}
                          type="button"
                          onClick={() => setUrgency(u.value)}
                          className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-center ${
                            urgency === u.value
                              ? 'bg-[hsl(25,45%,30%)] text-white'
                              : 'bg-white text-[hsl(25,20%,40%)] border border-[hsl(35,20%,87%)] hover:border-[hsl(35,25%,75%)]'
                          }`}
                        >
                          {u.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(3)}
                    disabled={!title.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-sm bg-[hsl(25,45%,30%)] text-white hover:bg-[hsl(25,45%,25%)] disabled:opacity-40 transition-all"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Step 3: Contact */}
              {step === 3 && (
                <div className="space-y-5 animate-fade-up">
                  <div>
                    <label className="block text-xs font-medium text-[hsl(25,15%,50%)] uppercase tracking-wider mb-2">
                      Your name
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[hsl(35,20%,87%)] bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(25,45%,35%)]/20 focus:border-[hsl(25,45%,35%)] text-base text-[hsl(25,20%,30%)] placeholder:text-[hsl(25,15%,72%)] transition-all"
                      placeholder="Your first name"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[hsl(25,15%,50%)] uppercase tracking-wider mb-2">
                      How should people reach you?
                    </label>
                    <div className="flex gap-2 mb-3">
                      {[
                        { value: 'app' as const, label: 'Through the board' },
                        { value: 'phone' as const, label: 'Phone' },
                        { value: 'email' as const, label: 'Email' },
                      ].map((m) => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setContactMethod(m.value)}
                          className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-center ${
                            contactMethod === m.value
                              ? 'bg-[hsl(25,45%,30%)] text-white'
                              : 'bg-white text-[hsl(25,20%,40%)] border border-[hsl(35,20%,87%)] hover:border-[hsl(35,25%,75%)]'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                    {contactMethod !== 'app' && (
                      <input
                        type={contactMethod === 'email' ? 'email' : 'tel'}
                        value={contactValue}
                        onChange={(e) => setContactValue(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[hsl(35,20%,87%)] bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(25,45%,35%)]/20 focus:border-[hsl(25,45%,35%)] text-sm text-[hsl(25,20%,30%)] placeholder:text-[hsl(25,15%,72%)] transition-all"
                        placeholder={contactMethod === 'phone' ? 'Your phone number' : 'Your email address'}
                      />
                    )}
                  </div>

                  {/* Preview */}
                  <div className="p-4 rounded-2xl bg-[hsl(35,30%,94%)] border border-[hsl(35,20%,88%)]">
                    <p className="text-xs text-[hsl(25,15%,55%)] mb-1.5 uppercase tracking-wider font-medium">Preview</p>
                    <p className="text-sm text-[hsl(25,30%,20%)]">
                      <span className={`font-semibold ${type === 'need' ? 'text-[hsl(18,60%,45%)]' : 'text-[hsl(145,30%,35%)]'}`}>
                        {type === 'need' ? 'Looking for' : 'Offering'}:
                      </span>{' '}
                      {title || '...'}
                    </p>
                    <p className="text-xs text-[hsl(25,15%,55%)] mt-1">by {contactName || '...'}</p>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !contactName.trim()}
                    className={`w-full py-4 rounded-xl font-semibold text-base text-white transition-all disabled:opacity-40 ${
                      type === 'need'
                        ? 'bg-[hsl(18,60%,52%)] hover:bg-[hsl(18,60%,46%)]'
                        : 'bg-[hsl(145,30%,42%)] hover:bg-[hsl(145,30%,36%)]'
                    }`}
                  >
                    {submitting ? 'Posting...' : 'Share with neighbours'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
