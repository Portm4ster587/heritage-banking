-- Fix 2: Restrict admin_user_summary view by revoking access from non-admin roles
REVOKE ALL ON public.admin_user_summary FROM anon;
REVOKE ALL ON public.admin_user_summary FROM authenticated;

-- Create a secure function that only admins can use to query user summaries
CREATE OR REPLACE FUNCTION public.get_admin_user_summary()
RETURNS TABLE (
  user_id uuid,
  first_name text,
  last_name text,
  username text,
  phone text,
  created_at timestamptz,
  total_balance numeric,
  account_count bigint,
  is_admin boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.admin_user_summary
  WHERE has_role(auth.uid(), 'admin'::app_role);
$$;

-- Grant execute only to authenticated users (function itself checks admin role)
REVOKE ALL ON FUNCTION public.get_admin_user_summary() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_user_summary() TO authenticated;

-- Fix 3: Set search_path on functions that are missing it
ALTER FUNCTION public.generate_application_number() SET search_path = public;
ALTER FUNCTION public.update_bill_payment_timestamp() SET search_path = public;
ALTER FUNCTION public.set_application_number() SET search_path = public;
ALTER FUNCTION public.update_admin_crypto_wallets_timestamp() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.setup_premium_user_accounts() SET search_path = public;
ALTER FUNCTION public.setup_invest_group_overseas_account() SET search_path = public;