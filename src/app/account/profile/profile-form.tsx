'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

const ds = { fontFamily: 'var(--font-display)' };
const sr = { fontFamily: 'var(--font-serif)' };

const NEIGHBOURHOODS = [
  'Old East Village', 'Wortley Village', 'Downtown', 'Old North',
  'Byron', 'Westmount', 'Masonville', 'Whitehills', 'Argyle',
  'Lambeth', 'Hyde Park', 'Oakridge', 'Stoney Creek', 'Huron Heights',
  'Hamilton Road', 'Pond Mills', 'White Oaks', 'Sherwood Forest',
  'Stoneybrook', 'Other',
];

export function ProfileForm({
  userId,
  initialName,
  initialNeighbourhood,
  initialBio,
}: {
  userId: string;
  initialName: string;
  initialNeighbourhood: string;
  initialBio: string;
}) {
  const [name, setName] = useState(initialName);
  const [neighbourhood, setNeighbourhood] = useState(initialNeighbourhood);
  const [bio, setBio] = useState(initialBio);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Display name is required'); return; }
    setSaving(true);
    setError('');
    setSaved(false);

    const supabase = createClient();
    const { error: err } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        display_name: name.trim(),
        neighbourhood: neighbourhood.trim() || null,
        bio: bio.trim() || null,
      }, { onConflict: 'id' });

    setSaving(false);
    if (err) {
      setError('Failed to save profile. Try again.');
      console.error('Profile save error:', err);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    }
  };

  const inputStyle = {
    background: 'var(--card)',
    color: 'var(--ink)',
    border: '1px solid var(--border-card)',
    fontFamily: 'var(--font-serif)',
  };

  return (
    <form onSubmit={handleSave}>
      <div className="space-y-6">
        {/* Display Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2"
            style={{ ...ds, color: 'var(--sub)', fontSize: '0.6rem' }}>
            Display name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            className="w-full px-4 py-3 text-sm"
            style={inputStyle}
            placeholder="How should people know you?"
          />
        </div>

        {/* Neighbourhood */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2"
            style={{ ...ds, color: 'var(--sub)', fontSize: '0.6rem' }}>
            Neighbourhood
          </label>
          <select
            value={NEIGHBOURHOODS.includes(neighbourhood) ? neighbourhood : neighbourhood ? 'Other' : ''}
            onChange={(e) => setNeighbourhood(e.target.value === 'Other' ? '' : e.target.value)}
            className="w-full px-4 py-3 text-sm"
            style={inputStyle}
          >
            <option value="">Choose your neighbourhood</option>
            {NEIGHBOURHOODS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          {(neighbourhood && !NEIGHBOURHOODS.includes(neighbourhood)) && (
            <input
              type="text"
              value={neighbourhood}
              onChange={(e) => setNeighbourhood(e.target.value)}
              maxLength={60}
              className="w-full px-4 py-3 text-sm mt-2"
              style={inputStyle}
              placeholder="Type your neighbourhood"
            />
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2"
            style={{ ...ds, color: 'var(--sub)', fontSize: '0.6rem' }}>
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 280))}
            maxLength={280}
            rows={3}
            className="w-full px-4 py-3 text-sm resize-none"
            style={inputStyle}
            placeholder="A little about you (optional)"
          />
          <p className="text-xs mt-1 text-right" style={{ color: 'var(--ink-muted)' }}>
            {bio.length}/280
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm" style={{ color: 'var(--need)' }}>{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40"
          style={{ ...ds, background: saved ? 'var(--offer)' : 'var(--card)', color: saved ? 'var(--card)' : 'var(--ink)', border: `1.5px solid ${saved ? 'var(--offer)' : 'var(--border-card)'}` }}
        >
          {saved ? <><Check className="w-4 h-4" /> Saved</> : saving ? 'Saving...' : 'Save profile'}
        </button>
      </div>
    </form>
  );
}
