-- Trims the skills table down to just id + name, per the admin UI now only
-- collecting a skill name. Run this in the Supabase SQL editor.

-- Drop dependents first so the column drops below don't error:
-- the trigger writes to updated_at, and the index covers category/order_index.
drop trigger if exists skills_set_updated_at on public.skills;
drop index if exists public.skills_order_idx;

alter table public.skills
  drop column if exists category,
  drop column if exists icon_name,
  drop column if exists proficiency,
  drop column if exists experience,
  drop column if exists overs,
  drop column if exists order_index,
  drop column if exists created_at,
  drop column if exists updated_at;

-- RLS policies aren't column-specific, so the existing "Public read skills"
-- policy from 0001_init.sql still applies as-is — nothing to change there.
