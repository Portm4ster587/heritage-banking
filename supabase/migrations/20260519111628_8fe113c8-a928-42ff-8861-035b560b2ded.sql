
-- Phone digits index for fast lookup
CREATE INDEX IF NOT EXISTS idx_profiles_phone_digits
  ON public.profiles ((regexp_replace(COALESCE(phone,''), '\D', '', 'g')));

-- Daily sent total (Zelle) for a user
CREATE OR REPLACE FUNCTION public.zelle_daily_sent_total(p_user_id uuid)
RETURNS numeric
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(SUM(amount), 0)::numeric
  FROM public.transfers
  WHERE user_id = p_user_id
    AND transfer_type = 'zelle'
    AND status IN ('pending','completed')
    AND created_at >= date_trunc('day', now() AT TIME ZONE 'UTC');
$$;

-- Lookup Zelle recipient by email or phone (returns user_id + account number)
CREATE OR REPLACE FUNCTION public.lookup_zelle_recipient(p_identifier text)
RETURNS TABLE(recipient_user_id uuid, recipient_account_number text, recipient_name text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_digits text;
BEGIN
  IF position('@' IN p_identifier) > 0 THEN
    SELECT id INTO v_user_id FROM auth.users
    WHERE lower(email) = lower(trim(p_identifier))
    LIMIT 1;
  ELSE
    v_digits := regexp_replace(p_identifier, '\D', '', 'g');
    IF length(v_digits) >= 7 THEN
      SELECT p.user_id INTO v_user_id FROM public.profiles p
      WHERE regexp_replace(COALESCE(p.phone,''),'\D','','g') LIKE '%' || right(v_digits,10)
      LIMIT 1;
    END IF;
  END IF;

  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT v_user_id,
         a.account_number,
         TRIM(COALESCE(pr.first_name,'') || ' ' || COALESCE(pr.last_name,''))
  FROM public.accounts a
  LEFT JOIN public.profiles pr ON pr.user_id = v_user_id
  WHERE a.user_id = v_user_id AND a.status = 'active'
  ORDER BY a.balance DESC
  LIMIT 1;
END;
$$;

-- Auto-complete pending Zelle external transfers older than 1 business day
CREATE OR REPLACE FUNCTION public.auto_complete_pending_zelle()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_count int := 0;
  r RECORD;
  v_cutoff timestamptz;
BEGIN
  -- Cutoff: at least 24 hours old; if cutoff lands on weekend, push to next Monday morning
  v_cutoff := now() - interval '1 day';

  FOR r IN
    SELECT id, user_id, amount, recipient_name, created_at
    FROM public.transfers
    WHERE transfer_type = 'zelle'
      AND status = 'pending'
      AND created_at <= v_cutoff
      -- skip if today is Saturday(6) or Sunday(0)
      AND EXTRACT(DOW FROM now()) NOT IN (0, 6)
  LOOP
    UPDATE public.transfers
    SET status = 'completed', completed_at = now()
    WHERE id = r.id;

    INSERT INTO public.user_notifications (user_id, title, message, type, priority)
    VALUES (
      r.user_id,
      'Zelle Payment Delivered',
      'Your $' || r.amount::text || ' Zelle to ' || COALESCE(r.recipient_name,'recipient') || ' has been delivered.',
      'transfer', 'normal'
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object('completed', v_count);
END;
$$;
