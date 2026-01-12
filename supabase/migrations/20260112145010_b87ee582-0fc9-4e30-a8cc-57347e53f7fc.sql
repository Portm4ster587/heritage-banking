-- Fix security issues from the previous migration

-- Drop the insecure view that exposes auth.users
DROP VIEW IF EXISTS public.admin_user_summary;

-- Create a secure version that doesn't expose auth.users directly
-- Use RLS-protected approach instead
CREATE OR REPLACE VIEW public.admin_user_summary WITH (security_invoker = on) AS
SELECT 
  p.user_id,
  p.first_name,
  p.last_name,
  p.username,
  p.phone,
  p.created_at,
  COALESCE((SELECT SUM(a.balance) FROM accounts a WHERE a.user_id = p.user_id), 0) as total_balance,
  (SELECT COUNT(*) FROM accounts a WHERE a.user_id = p.user_id) as account_count,
  EXISTS(SELECT 1 FROM user_roles ur WHERE ur.user_id = p.user_id AND ur.role = 'admin') as is_admin
FROM profiles p;