-- Fix security warning: Function Search Path Mutable
-- The has_role function already has 'set search_path = public' which is correct.
-- We need to check if there are other functions without proper search_path settings.

-- Re-create the function with explicit search_path (already done, but ensuring it's correct)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- Ensure the update trigger function also has proper search_path
create or replace function public.update_updated_at_column()
returns trigger 
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;