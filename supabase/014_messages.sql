-- Private messaging for Flourish
-- Run this in Supabase SQL editor after 013_crossstreet_geocoding.sql

-- Threads: one per (post, pair of users)
create table if not exists threads (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  poster_id uuid references auth.users(id) on delete cascade not null,
  responder_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  last_message_at timestamptz default now() not null,
  unique(post_id, poster_id, responder_id)
);

-- Messages within threads
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references threads(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  content text not null check (char_length(content) > 0),
  read boolean default false not null,
  created_at timestamptz default now() not null
);

-- Indexes
create index if not exists idx_threads_poster on threads(poster_id);
create index if not exists idx_threads_responder on threads(responder_id);
create index if not exists idx_threads_last_msg on threads(last_message_at desc);
create index if not exists idx_messages_thread on messages(thread_id, created_at);

-- RLS
alter table threads enable row level security;
alter table messages enable row level security;

create policy "Participants can see their threads" on threads
  for select using (auth.uid() = poster_id or auth.uid() = responder_id);

create policy "Poster can create threads" on threads
  for insert with check (auth.uid() = poster_id);

create policy "Participants can see messages" on messages
  for select using (
    exists (
      select 1 from threads
      where threads.id = messages.thread_id
      and (threads.poster_id = auth.uid() or threads.responder_id = auth.uid())
    )
  );

create policy "Participants can send messages" on messages
  for insert with check (
    auth.uid() = sender_id and
    exists (
      select 1 from threads
      where threads.id = messages.thread_id
      and (threads.poster_id = auth.uid() or threads.responder_id = auth.uid())
    )
  );

create policy "Participants can mark messages read" on messages
  for update using (
    exists (
      select 1 from threads
      where threads.id = messages.thread_id
      and (threads.poster_id = auth.uid() or threads.responder_id = auth.uid())
    )
  );
