-- Update admin account credentials for admin@heritagebank.com
-- First, ensure the profiles table has the correct username for admin login

-- Update the username lookup function to be case-insensitive
CREATE OR REPLACE FUNCTION public.get_user_by_username(_username text)
 RETURNS TABLE(user_id uuid, email text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.user_id, au.email
  FROM public.profiles p
  JOIN auth.users au ON au.id = p.user_id
  WHERE LOWER(p.username) = LOWER(_username)
     OR LOWER(au.email) = LOWER(_username)
  LIMIT 1;
$function$;

-- Add index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON public.profiles (LOWER(username));

-- Create a view for admin access to easily manage user accounts
CREATE OR REPLACE VIEW public.admin_user_summary AS
SELECT 
  p.user_id,
  p.first_name,
  p.last_name,
  p.username,
  au.email,
  p.phone,
  p.created_at,
  COALESCE(SUM(a.balance), 0) as total_balance,
  COUNT(DISTINCT a.id) as account_count,
  EXISTS(SELECT 1 FROM user_roles ur WHERE ur.user_id = p.user_id AND ur.role = 'admin') as is_admin
FROM profiles p
LEFT JOIN auth.users au ON au.id = p.user_id
LEFT JOIN accounts a ON a.user_id = p.user_id
GROUP BY p.user_id, p.first_name, p.last_name, p.username, au.email, p.phone, p.created_at;