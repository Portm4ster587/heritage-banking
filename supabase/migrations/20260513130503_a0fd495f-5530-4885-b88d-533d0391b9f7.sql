
-- Scheduled / recurring transfers
CREATE TABLE IF NOT EXISTS public.scheduled_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  transfer_kind text NOT NULL CHECK (transfer_kind IN ('internal','heritage','cross_bank','ach','wire')),
  from_account_id uuid NOT NULL,
  recipient_account_number text,
  recipient_name text,
  partner_bank text,
  amount numeric NOT NULL CHECK (amount > 0),
  memo text,
  category text,
  frequency text NOT NULL CHECK (frequency IN ('one_time','daily','weekly','biweekly','monthly')),
  next_run_at timestamptz NOT NULL,
  end_date timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled','completed')),
  last_run_at timestamptz,
  last_run_status text,
  run_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own scheduled transfers"
  ON public.scheduled_transfers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own scheduled transfers"
  ON public.scheduled_transfers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own scheduled transfers"
  ON public.scheduled_transfers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own scheduled transfers"
  ON public.scheduled_transfers FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage all scheduled transfers"
  ON public.scheduled_transfers FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_scheduled_transfers_next_run
  ON public.scheduled_transfers (status, next_run_at);

-- Add category to transfers for budgeting
ALTER TABLE public.transfers
  ADD COLUMN IF NOT EXISTS category text;

-- Admin approval wrappers
CREATE OR REPLACE FUNCTION public.admin_approve_cross_bank_transfer(p_transfer_id uuid, p_admin_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_t RECORD;
  v_result jsonb;
BEGIN
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RETURN jsonb_build_object('error', 'Not authorized');
  END IF;

  SELECT * INTO v_t FROM public.cross_bank_transfers WHERE id = p_transfer_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Transfer not found'); END IF;
  IF v_t.status <> 'pending' THEN
    RETURN jsonb_build_object('error', 'Only pending transfers can be approved');
  END IF;

  UPDATE public.cross_bank_transfers
  SET heritage_approved_at = now(),
      approved_by = p_admin_id,
      approved_at = now(),
      acfcu_approved_at = COALESCE(acfcu_approved_at, now()),
      updated_at = now()
  WHERE id = p_transfer_id;

  v_result := public.complete_cross_bank_transfer_if_ready(p_transfer_id);
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_decline_cross_bank_transfer(p_transfer_id uuid, p_admin_id uuid, p_reason text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RETURN jsonb_build_object('error', 'Not authorized');
  END IF;
  RETURN public.decline_cross_bank_transfer(p_transfer_id, COALESCE(p_reason, 'Declined by admin'));
END;
$$;

-- Trigger: notify admins when pending cross-bank transfer is created
CREATE OR REPLACE FUNCTION public.notify_admins_pending_cross_bank()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'pending' AND NEW.requires_dual_approval THEN
    INSERT INTO public.admin_notifications (title, message, type, priority, related_id, related_type)
    VALUES (
      'Cross-Bank Transfer Awaiting Approval',
      'New $' || NEW.amount::text || ' transfer to ' || COALESCE(NEW.recipient_name, 'recipient') || ' (' || upper(NEW.partner_bank) || ') needs review.',
      'cross_bank_transfer',
      'high',
      NEW.id,
      'cross_bank_transfer'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admins_pending_cross_bank ON public.cross_bank_transfers;
CREATE TRIGGER trg_notify_admins_pending_cross_bank
  AFTER INSERT ON public.cross_bank_transfers
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_pending_cross_bank();

-- updated_at trigger for scheduled_transfers
DROP TRIGGER IF EXISTS trg_scheduled_transfers_updated_at ON public.scheduled_transfers;
CREATE TRIGGER trg_scheduled_transfers_updated_at
  BEFORE UPDATE ON public.scheduled_transfers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
