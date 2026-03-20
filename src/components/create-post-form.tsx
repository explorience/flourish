'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CATEGORIES, URGENCIES, POST_TYPES } from '@/lib/constants';
import type { PostType, Category, Urgency, ContactMethod } from '@/types/database';
import { X } from 'lucide-react';

interface CreatePostFormProps {
  onClose: () => void;
}

export function CreatePostForm({ onClose }: CreatePostFormProps) {
  const [type, setType] = useState<PostType>('need');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [urgency, setUrgency] = useState<Urgency>('flexible');
  const [contactName, setContactName] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('app');
  const [contactValue, setContactValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contactName.trim()) return;

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
      setTimeout(() => {
        onClose();
      }, 1500);
    }

    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">🎉</p>
            <p className="text-xl font-semibold text-amber-900">Posted!</p>
            <p className="text-amber-600 mt-1">Your {type} is now visible to the community.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-amber-900">New Post</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-amber-100 text-amber-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type selector */}
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">What kind of post?</label>
                <div className="grid grid-cols-2 gap-3">
                  {POST_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`p-4 rounded-xl border-2 text-center font-semibold transition-all ${
                        type === t.value
                          ? t.value === 'need'
                            ? 'border-orange-400 bg-orange-50 text-orange-800'
                            : 'border-emerald-400 bg-emerald-50 text-emerald-800'
                          : 'border-amber-200 bg-white text-amber-600 hover:border-amber-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{t.emoji}</span>
                      I have a {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1">
                  {type === 'need' ? 'What do you need?' : 'What are you offering?'} *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-base"
                  placeholder={type === 'need' ? 'e.g. Ride to appointment Tuesday' : 'e.g. Winter coats, kids sizes'}
                  required
                />
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1">
                  Details (optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-base resize-none"
                  rows={3}
                  placeholder="Any extra info..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        category === c.value
                          ? 'bg-amber-700 text-white'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">How urgent?</label>
                <div className="flex gap-2 flex-wrap">
                  {URGENCIES.map((u) => (
                    <button
                      key={u.value}
                      type="button"
                      onClick={() => setUrgency(u.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        urgency === u.value
                          ? 'bg-amber-700 text-white'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1">
                  Your name *
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-base"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  How should people reach you?
                </label>
                <div className="flex gap-2 mb-2">
                  {[
                    { value: 'app' as const, label: 'Through the app' },
                    { value: 'phone' as const, label: 'Phone' },
                    { value: 'email' as const, label: 'Email' },
                  ].map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setContactMethod(m.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        contactMethod === m.value
                          ? 'bg-amber-700 text-white'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
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
                    className="w-full px-4 py-3 rounded-lg border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-base"
                    placeholder={contactMethod === 'phone' ? 'Your phone number' : 'Your email'}
                  />
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !title.trim() || !contactName.trim()}
                className={`w-full py-4 rounded-xl font-semibold text-lg text-white transition-colors disabled:opacity-50 shadow-lg ${
                  type === 'need'
                    ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                }`}
              >
                {submitting ? 'Posting...' : `Post ${type === 'need' ? 'Need' : 'Offer'}`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
