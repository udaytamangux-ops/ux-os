-- Supabase Row-Level Security + updated_at triggers.
-- Prisma cannot model these, so they are applied separately:
--   npm run db:policies   (uses `prisma db execute`)
-- or paste this whole file into Supabase → SQL Editor → Run.
-- Idempotent: safe to run repeatedly.

create extension if not exists "pgcrypto";

-- updated_at trigger ---------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists quick_notes_updated_at on public.quick_notes;
create trigger quick_notes_updated_at before update on public.quick_notes
  for each row execute function public.set_updated_at();

drop trigger if exists prompt_entries_updated_at on public.prompt_entries;
create trigger prompt_entries_updated_at before update on public.prompt_entries
  for each row execute function public.set_updated_at();

-- Enable RLS -----------------------------------------------------------------
alter table public.projects       enable row level security;
alter table public.contacts       enable row level security;
alter table public.quick_notes    enable row level security;
alter table public.activity       enable row level security;
alter table public.prompt_entries enable row level security;

-- Owner-only access ----------------------------------------------------------
drop policy if exists "Users manage own projects" on public.projects;
create policy "Users manage own projects" on public.projects for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public read for shared portfolio pages
drop policy if exists "Public can read public projects" on public.projects;
create policy "Public can read public projects" on public.projects for select
  using (is_portfolio_public = true);

drop policy if exists "Users manage own contacts" on public.contacts;
create policy "Users manage own contacts" on public.contacts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own quick notes" on public.quick_notes;
create policy "Users manage own quick notes" on public.quick_notes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own activity" on public.activity;
create policy "Users manage own activity" on public.activity for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own prompts" on public.prompt_entries;
create policy "Users manage own prompts" on public.prompt_entries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
