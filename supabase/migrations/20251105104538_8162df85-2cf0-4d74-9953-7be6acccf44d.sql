-- Add username field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Create function to look up user by username
CREATE OR REPLACE FUNCTION public.get_user_by_username(_username text)
RETURNS TABLE(user_id uuid, email text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, au.email
  FROM public.profiles p
  JOIN auth.users au ON au.id = p.user_id
  WHERE p.username = _username
  LIMIT 1;
$$;