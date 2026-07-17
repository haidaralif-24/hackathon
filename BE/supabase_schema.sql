-- Run this in Supabase SQL Editor to create the tables

create table if not exists public.files (
    id uuid primary key default gen_random_uuid(),
    filename text not null,
    source text not null default 'upload',
    synced_at timestamptz default now(),
    processed boolean default false
);

create table if not exists public.records (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references public.files(id) on delete cascade,
    created_at timestamptz default now(),
    extracted_json jsonb not null
);

create table if not exists public.chat_sessions (
    id uuid primary key default gen_random_uuid(),
    title text not null default 'New Chat',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists public.chat_messages (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references public.chat_sessions(id) on delete cascade,
    role text not null check (role in ('user', 'assistant', 'system')),
    content text not null,
    created_at timestamptz default now()
);

create table if not exists public.user_prefs (
    id uuid primary key default gen_random_uuid(),
    persona text not null default 'straightforward'
);

create table if not exists public.journal_entries (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    mood text not null check (mood in ('great', 'good', 'okay', 'bad', 'terrible')),
    content text not null default '',
    created_at timestamptz default now()
);
