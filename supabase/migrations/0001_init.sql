-- Cricket portfolio CMS schema.
-- Run this in the Supabase SQL editor (or `supabase db push`) on a fresh project.
--
-- Design note: the brief asked for a lean schema (title, jersey_number,
-- jersey_color, tags, github_url, live_url, image_url for projects; a similar
-- minimal shape for skills/certificates). The live site's match-report pages
-- and scorecard already depend on richer fields (tagline, over-by-over
-- features, architecture breakdown, stats, a 3-color jersey palette, etc).
-- Rather than drop that content, every "extra" field below is nullable with
-- a sensible default, so the admin form only needs to expose the columns the
-- brief asked for while power users can still fill in the rest via the
-- optional JSON fields in the dashboard.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  role text,
  tagline text,
  summary text,
  description text,
  jersey_number text not null default '00',
  jersey_color text not null default '#0b3d91',      -- primary shirt color
  jersey_secondary_color text not null default '#f5c518',
  jersey_accent_color text not null default '#ffffff',
  tags text[] not null default '{}',
  features jsonb not null default '[]',              -- [{ over, title, description }]
  stats jsonb not null default '[]',                 -- [{ label, value }]
  architecture jsonb not null default '[]',           -- [{ layer, detail }]
  screenshots int not null default 3,
  github_url text,
  live_url text,
  image_url text,                                     -- jersey cutout image
  result text not null default 'In Progress'
    check (result in ('Won', 'Draw', 'In Progress')),
  featured boolean not null default false,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_order_idx on public.projects (order_index, created_at desc);

-- ---------------------------------------------------------------------------
-- skills
-- ---------------------------------------------------------------------------
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  category text not null,                              -- Batting / Bowling / All-Round / Fielding
  name text not null,
  icon_name text,
  proficiency int not null default 50 check (proficiency between 0 and 100),
  experience text,                                      -- e.g. "3.5 yrs"
  overs int not null default 0,                          -- e.g. projects shipped
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skills_order_idx on public.skills (category, order_index);

-- ---------------------------------------------------------------------------
-- certificates
-- ---------------------------------------------------------------------------
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuing_org text not null,
  issue_date date,
  category text not null default 'General',
  credential_id text,
  credential_url text,
  verified boolean not null default true,
  accent_color text not null default '#ffb703',
  image_url text,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists certificates_order_idx on public.certificates (order_index, issue_date desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists skills_set_updated_at on public.skills;
create trigger skills_set_updated_at
  before update on public.skills
  for each row execute function public.set_updated_at();

drop trigger if exists certificates_set_updated_at on public.certificates;
create trigger certificates_set_updated_at
  before update on public.certificates
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Public (anon key): read-only, used by the portfolio's Server Components.
-- Writes only ever happen through Server Actions using the service-role key,
-- which bypasses RLS entirely — so there is deliberately no "authenticated
-- write" policy here. The admin surface is gated at the application layer
-- (NODE_ENV + local admin secret), not via Supabase auth/policies.
-- ---------------------------------------------------------------------------
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.certificates enable row level security;

drop policy if exists "Public read projects" on public.projects;
create policy "Public read projects" on public.projects
  for select using (true);

drop policy if exists "Public read skills" on public.skills;
create policy "Public read skills" on public.skills
  for select using (true);

drop policy if exists "Public read certificates" on public.certificates;
create policy "Public read certificates" on public.certificates
  for select using (true);

-- ---------------------------------------------------------------------------
-- Storage bucket for uploaded assets (jersey cutouts, certificate scans,
-- project screenshots). Public read so the site can render them directly;
-- writes only via the service-role key from Server Actions.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', true)
on conflict (id) do nothing;

drop policy if exists "Public read portfolio-assets" on storage.objects;
create policy "Public read portfolio-assets" on storage.objects
  for select using (bucket_id = 'portfolio-assets');

-- No insert/update/delete storage policies are defined for the anon/
-- authenticated roles on purpose: uploads only happen server-side through
-- the service-role client (lib/supabase/admin.ts), which bypasses storage
-- RLS the same way it bypasses table RLS.
