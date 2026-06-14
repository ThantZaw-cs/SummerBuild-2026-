-- Optional MVP policy if agency/admin users should be able to submit reports
-- through the same report form as citizens.
--
-- Citizens remain limited to inserting their own reports. Agency/admin users
-- can also insert rows for themselves after their profiles.role is manually
-- changed in Supabase.

create policy "Agency and admins can insert their own reports"
on public.reports
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.current_user_is_agency_or_admin()
);
