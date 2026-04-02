
-- Fix 1: Replace open TAC codes INSERT policy with admin-only
DROP POLICY IF EXISTS "System can create TAC codes" ON public.tac_codes;
CREATE POLICY "Admins can create TAC codes" ON public.tac_codes
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix 2: Replace open notifications INSERT policy with admin-only
DROP POLICY IF EXISTS "System can create notifications" ON public.user_notifications;
CREATE POLICY "Admins can create notifications" ON public.user_notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix 3: Fix get_user_by_username to prevent email enumeration
CREATE OR REPLACE FUNCTION public.get_user_by_username(_username text)
RETURNS TABLE(user_id uuid, email text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.user_id, au.email
  FROM public.profiles p
  JOIN auth.users au ON au.id = p.user_id
  WHERE LOWER(p.username) = LOWER(_username)
  LIMIT 1;
$$;
