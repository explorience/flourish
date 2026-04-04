'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Stats {
  total: number;
  active: number;
  pending: number;
  rejected: number;
}

interface PendingPost {
  id: string;
  title: string;
  type: 'need' | 'offer';
  category: string;
  contact_name: string;
  created_at: string;
  moderation_status: string | null;
  status: string;
}

interface Moderator {
  id: string;
  email: string;
  role: 'admin' | 'mod';
  name: string | null;
  created_at: string;
}

interface AdminDashboardProps {
  stats: Stats;
  pendingPosts: PendingPost[];
  moderators: Moderator[];
  isAdmin: boolean;
  currentUserEmail: string;
  settings?: Record<string, any>;
}

export function AdminDashboard({
  stats: initialStats,
  pendingPosts: initialPosts,
  moderators: initialModerators,
  isAdmin,
  currentUserEmail,
  settings: initialSettings,
}: AdminDashboardProps) {
  const [stats, setStats] = useState(initialStats);
  const [posts, setPosts] = useState(initialPosts);
  const [moderators, setModerators] = useState(initialModerators);
  const [vouchRequired, setVouchRequired] = useState(initialSettings?.require_vouch === true);
  const [togglingVouch, setTogglingVouch] = useState(false);
  const [moderating, setModerating] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);
  const [newModEmail, setNewModEmail] = useState('');
  const [newModName, setNewModName] = useState('');
  const [addingMod, setAddingMod] = useState(false);
  const [modError, setModError] = useState('');
  const [actionFeedback, setActionFeedback] = useState<Record<string, 'approved' | 'rejected'>>({});

  const ds: React.CSSProperties = { fontFamily: 'var(--font-display)' };
  const sr: React.CSSProperties = { fontFamily: 'var(--font-serif)' };

  const handleModerate = async (postId: string, action: 'approve' | 'reject', reason?: string) => {
    setModerating(postId);
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action, reason }),
      });
      if (res.ok) {
        setActionFeedback((prev) => ({ ...prev, [postId]: action === 'approve' ? 'approved' : 'rejected' }));
        setTimeout(() => {
          setPosts((prev) => prev.filter((p) => p.id !== postId));
          setActionFeedback((prev) => {
            const next = { ...prev };
            delete next[postId];
            return next;
          });
        }, 800);
        setShowRejectInput(null);
      }
    } catch (err) {
      console.error('Moderate error:', err);
    } finally {
      setModerating(null);
    }
  };

  const handleAddModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModEmail.trim()) return;
    setAddingMod(true);
    setModError('');
    try {
      const res = await fetch('/api/admin/moderators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newModEmail.trim(), name: newModName.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModError(data.error || 'Failed to add moderator.');
      } else {
        setModerators((prev) => [...prev, data.moderator]);
        setNewModEmail('');
        setNewModName('');
      }
    } catch {
      setModError('Server error. Please try again.');
    } finally {
      setAddingMod(false);
    }
  };

  const handleRemoveModerator = async (id: string, email: string) => {
    if (email === currentUserEmail) {
      alert("You can't remove yourself.");
      return;
    }
    if (!confirm(`Remove moderator ${email}?`)) return;
    try {
      const res = await fetch(`/api/admin/moderators?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setModerators((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error('Remove mod error:', err);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-light)',
    border: '1px solid var(--border)',
    color: 'var(--heading)',
    padding: '10px 14px',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.6rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: 'var(--sub)',
    marginBottom: '0.3125rem',
    ...ds,
  };

  return (
    <div className="space-y-8">

      {/* ─── Stats ─── */}
      <section>
        <h2
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ ...ds, color: 'var(--sub)' }}
        >
          Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Posts', value: stats.total, color: 'var(--heading)' },
            { label: 'Active', value: stats.active, color: 'var(--offer)' },
            { label: 'Needs Review', value: stats.pending, color: 'var(--need)' },
            { label: 'Rejected', value: stats.rejected, color: 'var(--ink-muted)' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-5"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div
                className="text-3xl font-extrabold leading-none mb-1"
                style={{ ...ds, color: stat.color }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs font-bold uppercase tracking-wider"
                style={{ ...ds, color: 'var(--ink-muted)' }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Quick Links ─── */}
      <section>
        <h2
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ ...ds, color: 'var(--sub)' }}
        >
          Quick Links
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/', label: 'View Board' },
            { href: '/about', label: 'About Page' },
            { href: '/feedback', label: 'Feedback Page' },
            { href: '/guide', label: 'Moderator Guide', external: false },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider"
              style={{ ...ds, border: '1px solid var(--border)', color: 'var(--sub)' }}
            >
              {link.label} {link.external ? '↗' : '→'}
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Settings ─── */}
      {isAdmin && (
        <section>
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ ...ds, color: 'var(--sub)' }}
          >
            Settings
          </h2>
          <div className="p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                  Require vouching to post
                </div>
                <div className="text-xs mt-1" style={{ ...sr, color: 'var(--ink-muted)' }}>
                  {vouchRequired
                    ? 'Users must be vouched by an existing member before they can post or respond.'
                    : 'Anyone with the site URL can post freely. Turn this on when you need more trust controls.'}
                </div>
              </div>
              <button
                onClick={async () => {
                  setTogglingVouch(true);
                  try {
                    const res = await fetch('/api/admin/settings', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ key: 'require_vouch', value: !vouchRequired }),
                    });
                    if (res.ok) setVouchRequired(!vouchRequired);
                  } catch (e) {
                    console.error('Toggle error:', e);
                  } finally {
                    setTogglingVouch(false);
                  }
                }}
                disabled={togglingVouch}
                className="flex-shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-all"
                style={{
                  ...ds,
                  fontSize: '0.65rem',
                  background: vouchRequired ? 'var(--offer)' : 'transparent',
                  color: vouchRequired ? 'var(--card)' : 'var(--ink-muted)',
                  border: vouchRequired ? 'none' : '1px solid var(--border)',
                }}
              >
                {togglingVouch ? '...' : vouchRequired ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ─── Posts needing moderation ─── */}
      <section>
        <h2
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ ...ds, color: 'var(--sub)' }}
        >
          Posts Needing Review{posts.length > 0 && <span style={{ color: 'var(--need)' }}> ({posts.length})</span>}
        </h2>

        {posts.length === 0 ? (
          <div
            className="p-8 text-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p className="text-sm" style={{ ...sr, color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              All caught up — no posts need review.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => {
              const fb = actionFeedback[post.id];
              return (
                <div
                  key={post.id}
                  className="p-4 transition-all"
                  style={{
                    background: fb === 'approved' ? 'rgba(58,106,74,0.15)' : fb === 'rejected' ? 'rgba(208,112,64,0.1)' : 'var(--card)',
                    border: `1px solid ${fb === 'approved' ? 'var(--offer)' : fb === 'rejected' ? 'var(--need)' : 'var(--border)'}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="text-xs font-bold uppercase"
                          style={{ ...ds, color: post.type === 'need' ? 'var(--need)' : 'var(--offer)', letterSpacing: '0.1em' }}
                        >
                          {post.type}
                        </span>
                        <span
                          className="text-xs"
                          style={{ ...ds, color: 'var(--ink-muted)', letterSpacing: '0.05em' }}
                        >
                          {post.category}
                        </span>
                        {post.moderation_status && (
                          <span
                            className="text-xs font-bold uppercase px-1.5 py-0.5"
                            style={{ ...ds, background: 'rgba(208,112,64,0.15)', color: 'var(--need)', fontSize: '0.55rem', letterSpacing: '0.1em' }}
                          >
                            {post.moderation_status}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/post/${post.id}`}
                        target="_blank"
                        className="text-sm font-medium hover:underline"
                        style={{ color: 'var(--ink)' }}
                      >
                        {post.title} ↗
                      </Link>
                      <div className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
                        {post.contact_name} &mdash; {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </div>
                    </div>

                    {!fb && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {showRejectInput === post.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Reason (optional)"
                              value={rejectReason[post.id] || ''}
                              onChange={(e) => setRejectReason((prev) => ({ ...prev, [post.id]: e.target.value }))}
                              style={{ ...inputStyle, width: '11.25rem', padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                            />
                            <button
                              onClick={() => handleModerate(post.id, 'reject', rejectReason[post.id])}
                              disabled={moderating === post.id}
                              className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                              style={{ ...ds, background: 'var(--need)', color: 'white', fontSize: '0.6rem' }}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setShowRejectInput(null)}
                              className="px-2 py-1.5 text-xs"
                              style={{ color: 'var(--ink-muted)' }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleModerate(post.id, 'approve')}
                              disabled={moderating === post.id}
                              className="px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-colors"
                              style={{ ...ds, background: 'var(--offer)', color: 'white', fontSize: '0.65rem' }}
                              title="Approve"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => setShowRejectInput(post.id)}
                              disabled={moderating === post.id}
                              className="px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-colors"
                              style={{ ...ds, background: 'var(--need)', color: 'white', fontSize: '0.65rem' }}
                              title="Reject"
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    {fb && (
                      <div
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ ...ds, color: fb === 'approved' ? 'var(--offer)' : 'var(--need)' }}
                      >
                        {fb === 'approved' ? '✓ Approved' : '✕ Rejected'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── Moderator management (admin only) ─── */}
      {isAdmin && (
        <section>
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ ...ds, color: 'var(--sub)' }}
          >
            Moderators
          </h2>

          {/* Add form */}
          <form onSubmit={handleAddModerator} className="mb-5 p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3
              className="text-xs font-bold uppercase tracking-wider mb-4"
              style={{ ...ds, color: 'var(--ink-muted)' }}
            >
              Add Moderator
            </h3>
            <div className="flex gap-3 flex-wrap items-end">
              <div style={{ flex: '1 1 180px' }}>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={newModEmail}
                  onChange={(e) => setNewModEmail(e.target.value)}
                  required
                  style={inputStyle}
                  placeholder="mod@example.com"
                />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>Name (optional)</label>
                <input
                  type="text"
                  value={newModName}
                  onChange={(e) => setNewModName(e.target.value)}
                  style={inputStyle}
                  placeholder="Display name"
                />
              </div>
              <button
                type="submit"
                disabled={addingMod || !newModEmail.trim()}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                style={{ ...ds, background: 'var(--ink)', color: 'var(--card)' }}
              >
                {addingMod ? 'Adding…' : 'Add'}
              </button>
            </div>
            {modError && (
              <p className="text-xs mt-2" style={{ color: 'var(--need)' }}>{modError}</p>
            )}
          </form>

          {/* Moderators list */}
          <div className="space-y-2">
            {moderators.map((mod) => (
              <div
                key={mod.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                      {mod.name || mod.email}
                    </span>
                    <span
                      className="text-xs font-bold uppercase px-1.5 py-0.5"
                      style={{
                        ...ds,
                        fontSize: '0.55rem',
                        letterSpacing: '0.1em',
                        background: mod.role === 'admin' ? 'rgba(58,106,74,0.2)' : 'rgba(168,191,168,0.15)',
                        color: mod.role === 'admin' ? 'var(--offer)' : 'var(--sub)',
                      }}
                    >
                      {mod.role}
                    </span>
                  </div>
                  {mod.name && (
                    <div className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>{mod.email}</div>
                  )}
                </div>
                {mod.email !== currentUserEmail && (
                  <button
                    onClick={() => handleRemoveModerator(mod.id, mod.email)}
                    className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 transition-colors"
                    style={{ ...ds, color: 'var(--need)', border: '1px solid rgba(208,112,64,0.3)', fontSize: '0.6rem' }}
                  >
                    Remove
                  </button>
                )}
                {mod.email === currentUserEmail && (
                  <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>You</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
