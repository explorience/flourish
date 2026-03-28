'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface MessageThreadProps {
  threadId: string;
  currentUserId: string;
  initialMessages: Message[];
  otherName: string;
}

function formatMsgTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
}

export function MessageThread({ threadId, currentUserId, initialMessages, otherName }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on load + new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${threadId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `thread_id=eq.${threadId}`,
      }, (payload) => {
        const msg = payload.new as Message;
        setMessages((prev) => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        // Mark as read if from other party
        if (msg.sender_id !== currentUserId) {
          supabase.from('messages').update({ read: true }).eq('id', msg.id).then(() => {});
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [threadId, currentUserId]);

  const send = async () => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setContent('');

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, content: trimmed }),
    });

    if (!res.ok) {
      setContent(trimmed); // restore on failure
    }
    setSending(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Group messages by date for date separators
  const grouped: { date: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const d = new Date(msg.created_at);
    const label = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMMM d, yyyy');
    const last = grouped[grouped.length - 1];
    if (last?.date === label) {
      last.messages.push(msg);
    } else {
      grouped.push({ date: label, messages: [msg] });
    }
  });

  const ds = { fontFamily: 'var(--font-display)' } as React.CSSProperties;
  const sr = { fontFamily: 'var(--font-serif)' } as React.CSSProperties;

  return (
    <div className="flex flex-col flex-1" style={{ minHeight: 0 }}>
      {/* Scrollable message area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6" style={{ paddingBottom: '6.25rem' }}>
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm italic" style={{ ...sr, color: 'var(--ink-muted)' }}>
              Start the conversation with {otherName}.
            </p>
          </div>
        )}

        {grouped.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs uppercase tracking-wider" style={{ ...ds, color: 'var(--ink-muted)', fontSize: '0.58rem' }}>
                {group.date}
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            <div className="space-y-2">
              {group.messages.map((msg, i) => {
                const isMe = msg.sender_id === currentUserId;
                const prevMsg = group.messages[i - 1];
                const showName = !isMe && prevMsg?.sender_id !== msg.sender_id;

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {showName && (
                      <span className="text-xs mb-1 ml-1" style={{ ...ds, color: 'var(--ink-muted)', fontSize: '0.6rem' }}>
                        {otherName}
                      </span>
                    )}
                    <div
                      className="max-w-xs sm:max-w-sm lg:max-w-md px-4 py-2.5"
                      style={{
                        background: isMe ? 'var(--ink)' : 'var(--card)',
                        color: isMe ? 'var(--bg)' : 'var(--ink)',
                        borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        border: isMe ? 'none' : '1px solid var(--border)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.content}
                    </div>
                    <span className="text-xs mt-1 mx-1" style={{ color: 'var(--ink-muted)', fontSize: '0.6rem' }}>
                      {formatMsgTime(msg.created_at)}
                      {isMe && msg.read && <span style={{ color: 'var(--offer)' }}> · seen</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Send box — fixed to bottom */}
      <div
        className="sticky bottom-0 px-4 py-3 border-t"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-2xl mx-auto flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message…"
            rows={1}
            className="flex-1 resize-none px-4 py-3 text-sm focus:outline-none"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border-card)',
              color: 'var(--ink)',
              fontFamily: 'var(--font-body)',
              maxHeight: '7.5rem',
              overflowY: 'auto',
              lineHeight: 1.5,
            }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={send}
            disabled={!content.trim() || sending}
            className="flex-shrink-0 p-3 transition-all disabled:opacity-40"
            style={{
              background: 'var(--offer)',
              color: '#fff',
              border: 'none',
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-xs mt-1.5" style={{ color: 'var(--ink-muted)', fontSize: '0.58rem' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
