-- CivicLens Supabase schema
-- Paste this file into the Supabase SQL Editor and run it once.

create extension if not exists pgcrypto;

create type public.user_role as enum ('citizen', 'admin', 'agency');
create type public.report_severity as enum ('Low', 'Medium', 'High', 'Critical');
create type public.report_status as enum (
  'submitted',
  'under_review',
  'assigned',
  'in_progress',
  'resolved',
  'rejected'
);
create type public.report_media_type as enum ('image', 'video');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'citizen',
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  short_description text not null,
  location_text text not null,
  latitude double precision,
  longitude double precision,
  media_url text,
  media_type public.report_media_type default 'image',
  issue_type text,
  severity public.report_severity not null default 'Low',
  authenticity_score numeric(5, 2) not null default 0,
  ai_summary text,
  recommended_action text,
  priority_score integer not null default 0,
  duplicate_count integer not null default 0,
  status public.report_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reports_authenticity_score_range
    check (authenticity_score >= 0 and authenticity_score <= 100),
  constraint reports_priority_score_range
    check (priority_score >= 0 and priority_score <= 100),
  constraint reports_duplicate_count_range
    check (duplicate_count >= 0),
  constraint reports_latitude_range
    check (latitude is null or (latitude >= -90 and latitude <= 90)),
  constraint reports_longitude_range
    check (longitude is null or (longitude >= -180 and longitude <= 180))
);

create table public.report_duplicates (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  duplicate_of_report_id uuid not null references public.reports(id) on delete cascade,
  similarity_score numeric(5, 2) not null default 0,
  created_at timestamptz not null default now(),
  constraint report_duplicates_similarity_score_range
    check (similarity_score >= 0 and similarity_score <= 100),
  constraint report_duplicates_not_self
    check (report_id <> duplicate_of_report_id),
  constraint report_duplicates_unique_pair
    unique (report_id, duplicate_of_report_id)
);

create index reports_location_idx on public.reports (latitude, longitude);
create index reports_status_idx on public.reports (status);
create index reports_severity_idx on public.reports (severity);
create index reports_created_at_idx on public.reports (created_at desc);
create index reports_user_id_idx on public.reports (user_id);
create index report_duplicates_report_id_idx on public.report_duplicates (report_id);
create index report_duplicates_duplicate_of_report_id_idx
  on public.report_duplicates (duplicate_of_report_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_reports_updated_at
before update on public.reports
for each row
execute function public.set_updated_at();

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

create or replace function public.prevent_report_status_only_update()
returns trigger
language plpgsql
as $$
begin
  if new.id <> old.id
    or new.user_id <> old.user_id
    or new.short_description <> old.short_description
    or new.location_text <> old.location_text
    or new.latitude is distinct from old.latitude
    or new.longitude is distinct from old.longitude
    or new.media_url is distinct from old.media_url
    or new.media_type is distinct from old.media_type
    or new.issue_type is distinct from old.issue_type
    or new.severity <> old.severity
    or new.authenticity_score <> old.authenticity_score
    or new.ai_summary is distinct from old.ai_summary
    or new.recommended_action is distinct from old.recommended_action
    or new.priority_score <> old.priority_score
    or new.duplicate_count <> old.duplicate_count
    or new.created_at <> old.created_at then
    raise exception 'Only report status can be updated from the client';
  end if;

  return new;
end;
$$;

create trigger enforce_report_status_only_update
before update on public.reports
for each row
execute function public.prevent_report_status_only_update();

alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.report_duplicates enable row level security;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Agency and admins can read all profiles"
on public.profiles
for select
to authenticated
using (public.current_user_is_agency_or_admin());

create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid() and role = 'citizen');

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Citizens can insert their own reports"
on public.reports
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'citizen'
  )
);

create policy "Agency and admins can insert their own reports"
on public.reports
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.current_user_is_agency_or_admin()
);

create policy "Citizens can read their own reports"
on public.reports
for select
to authenticated
using (user_id = auth.uid());

create policy "Agency and admins can read all reports"
on public.reports
for select
to authenticated
using (public.current_user_is_agency_or_admin());

create policy "Agency and admins can update report status"
on public.reports
for update
to authenticated
using (public.current_user_is_agency_or_admin())
with check (public.current_user_is_agency_or_admin());

create policy "Agency and admins can read duplicate links"
on public.report_duplicates
for select
to authenticated
using (public.current_user_is_agency_or_admin());

create policy "Agency and admins can insert duplicate links"
on public.report_duplicates
for insert
to authenticated
with check (public.current_user_is_agency_or_admin());

revoke all on public.profiles from anon, authenticated;
revoke all on public.reports from anon, authenticated;
revoke all on public.report_duplicates from anon, authenticated;

grant select, insert on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant select, insert on public.reports to authenticated;
grant update (status) on public.reports to authenticated;
grant select, insert on public.report_duplicates to authenticated;
