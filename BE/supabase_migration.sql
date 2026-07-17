-- Migration: add user_id to chat_sessions, journal_entries, user_prefs
-- Run this in Supabase SQL Editor AFTER the main schema

alter table public.chat_sessions add column user_id uuid not null default '00000000-0000-0000-0000-000000000000' references auth.users(id) on delete cascade;
alter table public.journal_entries add column user_id uuid not null default '00000000-0000-0000-0000-000000000000' references auth.users(id) on delete cascade;
alter table public.user_prefs add column user_id uuid not null default '00000000-0000-0000-0000-000000000000' references auth.users(id) on delete cascade;

-- chat_messages scoped through chat_sessions, no direct user_id needed
-- files and records intentionally left global (shared mock data)

-- Row Level Security

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.journal_entries enable row level security;
alter table public.user_prefs enable row level security;

-- chat_sessions: users see only their own sessions
drop policy if exists chat_sessions_user_isolation on public.chat_sessions;
create policy chat_sessions_user_isolation on public.chat_sessions
  for all using (auth.uid() = user_id);

-- chat_messages: scoped through chat_sessions
drop policy if exists chat_messages_user_isolation on public.chat_messages;
create policy chat_messages_user_isolation on public.chat_messages
  for all using (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = chat_messages.session_id
        and chat_sessions.user_id = auth.uid()
    )
  );

-- journal_entries
drop policy if exists journal_entries_user_isolation on public.journal_entries;
create policy journal_entries_user_isolation on public.journal_entries
  for all using (auth.uid() = user_id);

-- user_prefs
drop policy if exists user_prefs_user_isolation on public.user_prefs;
create policy user_prefs_user_isolation on public.user_prefs
  for all using (auth.uid() = user_id);
