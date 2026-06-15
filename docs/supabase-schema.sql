-- CivicLens MVP Supabase Schema
-- Paste this into the Supabase SQL Editor for a fresh MVP database.

create extension if not exists pgcrypto;

-- =========================
-- ENUM TYPES
-- =========================

do $$ begin
  create type public.user_role as enum ('citizen', 'agency', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.report_status as enum (
    'pending_review',
    'under_review',
    'verified',
    'assigned',
    'in_progress',
    'resolved',
    'rejected'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.report_severity as enum ('low', 'medium', 'high', 'critical');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.report_media_type as enum ('image', 'video');
exception when duplicate_object then null;
end $$;

-- =========================
-- TABLES
-- =========================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role public.user_role not null default 'citizen',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  submitted_by_name text,
  title text,
  short_description text not null,
  description text,
  category text,
  issue_type text not null default 'Analysis pending',
  location_text text not null,
  latitude double precision,
  longitude double precision,
  severity public.report_severity not null default 'low',
  status public.report_status not null default 'pending_review',
  authenticity_score numeric(5, 2) not null default 0,
  duplicate_count integer not null default 0,
  congestion_impact text not null default 'Pending analysis',
  priority_score integer not null default 0,
  recommended_action text not null default 'Awaiting AI analysis',
  ai_summary text not null default 'AI-generated maintenance report will appear here after analysis.',
  media_url text,
  media_type public.report_media_type default 'image',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reports_authenticity_score_range
    check (authenticity_score >= 0 and authenticity_score <= 100),
  constraint reports_priority_score_range
    check (priority_score >= 0 and priority_score <= 100),
  constraint reports_duplicate_count_range
    check (duplicate_count >= 0),
  constraint reports_latitude_range
    check (latitude is null or latitude between -90 and 90),
  constraint reports_longitude_range
    check (longitude is null or longitude between -180 and 180)
);

create table if not exists public.report_activity_logs (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  old_status public.report_status,
  new_status public.report_status,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.report_duplicates (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  duplicate_of_report_id uuid not null references public.reports(id) on delete cascade,
  similarity_score numeric(5, 2) not null default 0,
  created_at timestamptz not null default now(),
  constraint report_duplicates_not_self
    check (report_id <> duplicate_of_report_id),
  constraint report_duplicates_similarity_score_range
    check (similarity_score >= 0 and similarity_score <= 100),
  constraint report_duplicates_unique_pair
    unique (report_id, duplicate_of_report_id)
);

-- =========================
-- INDEXES
-- =========================

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists reports_user_id_idx on public.reports(user_id);
create index if not exists reports_status_idx on public.reports(status);
create index if not exists reports_severity_idx on public.reports(severity);
create index if not exists reports_priority_score_idx on public.reports(priority_score desc);
create index if not exists reports_created_at_idx on public.reports(created_at desc);
create index if not exists reports_location_idx on public.reports(latitude, longitude);
create index if not exists report_activity_logs_report_id_idx on public.report_activity_logs(report_id);
create index if not exists report_duplicates_report_id_idx on public.report_duplicates(report_id);
create index if not exists report_duplicates_duplicate_of_report_id_idx
  on public.report_duplicates(duplicate_of_report_id);

-- =========================
-- UPDATED_AT TRIGGER
-- =========================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_reports_updated_at on public.reports;
create trigger set_reports_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

-- =========================
-- ROLE HELPER
-- =========================

create or replace function public.current_user_is_agency_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('agency', 'admin')
  );
$$;

-- =========================
-- RLS
-- =========================

alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.report_activity_logs enable row level security;
alter table public.report_duplicates enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

drop policy if exists "Users can create own citizen profile" on public.profiles;
create policy "Users can create own citizen profile"
on public.profiles for insert to authenticated
with check (id = auth.uid() and role = 'citizen');

drop policy if exists "Users can update own profile name" on public.profiles;
create policy "Users can update own profile name"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Agency admins can read profiles" on public.profiles;
create policy "Agency admins can read profiles"
on public.profiles for select to authenticated
using (public.current_user_is_agency_or_admin());

drop policy if exists "Authenticated users can create own reports" on public.reports;
create policy "Authenticated users can create own reports"
on public.reports for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "Citizens can read own reports" on public.reports;
create policy "Citizens can read own reports"
on public.reports for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Agency admins can read all reports" on public.reports;
create policy "Agency admins can read all reports"
on public.reports for select to authenticated
using (public.current_user_is_agency_or_admin());

drop policy if exists "Agency admins can update reports" on public.reports;
create policy "Agency admins can update reports"
on public.reports for update to authenticated
using (public.current_user_is_agency_or_admin())
with check (public.current_user_is_agency_or_admin());

drop policy if exists "Citizens can read own report activity logs" on public.report_activity_logs;
create policy "Citizens can read own report activity logs"
on public.report_activity_logs for select to authenticated
using (
  exists (
    select 1
    from public.reports
    where reports.id = report_activity_logs.report_id
      and reports.user_id = auth.uid()
  )
);

drop policy if exists "Agency admins can read activity logs" on public.report_activity_logs;
create policy "Agency admins can read activity logs"
on public.report_activity_logs for select to authenticated
using (public.current_user_is_agency_or_admin());

drop policy if exists "Agency admins can insert activity logs" on public.report_activity_logs;
create policy "Agency admins can insert activity logs"
on public.report_activity_logs for insert to authenticated
with check (public.current_user_is_agency_or_admin());

drop policy if exists "Agency admins can read duplicates" on public.report_duplicates;
create policy "Agency admins can read duplicates"
on public.report_duplicates for select to authenticated
using (public.current_user_is_agency_or_admin());

drop policy if exists "Agency admins can insert duplicates" on public.report_duplicates;
create policy "Agency admins can insert duplicates"
on public.report_duplicates for insert to authenticated
with check (public.current_user_is_agency_or_admin());

-- =========================
-- GRANTS
-- =========================

revoke all on public.profiles from anon, authenticated;
revoke all on public.reports from anon, authenticated;
revoke all on public.report_activity_logs from anon, authenticated;
revoke all on public.report_duplicates from anon, authenticated;

grant select, insert on public.profiles to authenticated;
grant update(full_name) on public.profiles to authenticated;

grant select, insert on public.reports to authenticated;
grant update(
  status,
  severity,
  priority_score,
  recommended_action,
  ai_summary,
  duplicate_count,
  congestion_impact,
  issue_type,
  category,
  internal_notes
) on public.reports to authenticated;

grant select, insert on public.report_activity_logs to authenticated;
grant select, insert on public.report_duplicates to authenticated;

-- =========================
-- STORAGE BUCKET RECOMMENDATION
-- =========================

insert into storage.buckets (id, name, public)
values ('report-media', 'report-media', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users upload report media" on storage.objects;
create policy "Authenticated users upload report media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'report-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users read report media" on storage.objects;
create policy "Authenticated users read report media"
on storage.objects for select to authenticated
using (bucket_id = 'report-media');
