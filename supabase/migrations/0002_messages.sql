-- Contact Box submissions. Written only via the server route
-- (app/api/contact/route.ts) using the service-role client, which bypasses
-- RLS — so no public insert/select policy is needed or defined here. This
-- table is a durable backup of every submission regardless of whether email
-- delivery (Resend) succeeds.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  purpose text,
  phone text,
  email text not null,
  question text not null,
  email_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_created_at_idx on public.messages (created_at desc);

alter table public.messages enable row level security;
-- Intentionally no policies: only the service-role key (bypasses RLS) ever
-- touches this table, from the trusted server-side contact route.
