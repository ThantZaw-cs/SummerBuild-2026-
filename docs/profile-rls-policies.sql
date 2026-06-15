-- Run this in Supabase if your existing database was created before profile
-- self-update support was added.
--
-- Required for the MVP auth flow:
-- - authenticated users can select their own profile
-- - authenticated users can insert their own citizen profile
-- - authenticated users can update only their own full_name, not their role
-- - agency/admin role changes are done manually in Supabase

drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

grant update (full_name) on public.profiles to authenticated;
