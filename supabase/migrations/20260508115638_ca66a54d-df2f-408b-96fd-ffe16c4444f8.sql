
-- Add held_amount to accounts (reserved funds for pending transfers)
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS held_amount numeric NOT NULL DEFAULT 0;

-- Add dual-approval coordination columns to cross_bank_transfers
ALTER TABLE public.cross_bank_transfers
  ADD COLUMN IF NOT EXISTS requires_dual_approval boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS acfcu_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS heritage_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS declined_reason text;

-- Atomic cross-bank transfer with $50k threshold rule
CREATE OR REPLACE FUNCTION public.process_cross_bank_transfer(
  p_sender_id uuid,
  p_from_account_id uuid,
  p_recipient_account_number text,
  p_recipient_name text,
  p_amount numeric,
  p_partner_bank text DEFAULT 'acfcu',
  p_memo text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender RECORD;
  v_transfer_id uuid;
  v_threshold numeric := 50000;
  v_requires_dual boolean;
  v_status text;
  v_available numeric;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object('error', 'Invalid amount');
  END IF;

  -- Lock sender account
  SELECT id, user_id, balance, held_amount, account_number, status
  INTO v_sender
  FROM public.accounts
  WHERE id = p_from_account_id AND user_id = p_sender_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Source account not found');
  END IF;

  IF v_sender.status <> 'active' THEN
    RETURN jsonb_build_object('error', 'Source account is not active');
  END IF;

  v_available := COALESCE(v_sender.balance, 0) - COALESCE(v_sender.held_amount, 0);
  IF v_available < p_amount THEN
    RETURN jsonb_build_object('error', 'Insufficient available funds');
  END IF;

  v_requires_dual := p_amount >= v_threshold;

  IF v_requires_dual THEN
    -- Hold funds (do NOT debit balance yet)
    UPDATE public.accounts
    SET held_amount = COALESCE(held_amount, 0) + p_amount,
        updated_at = now()
    WHERE id = v_sender.id;
    v_status := 'pending';
  ELSE
    -- Debit immediately
    UPDATE public.accounts
    SET balance = balance - p_amount,
        updated_at = now()
    WHERE id = v_sender.id;
    v_status := 'completed';
  END IF;

  INSERT INTO public.cross_bank_transfers (
    user_id, direction, partner_bank,
    from_account_id, from_account_number,
    recipient_account_number, recipient_name,
    amount, memo, status,
    requires_dual_approval,
    completed_at
  ) VALUES (
    p_sender_id, 'outgoing', p_partner_bank,
    v_sender.id, v_sender.account_number,
    p_recipient_account_number, p_recipient_name,
    p_amount, p_memo, v_status,
    v_requires_dual,
    CASE WHEN v_status = 'completed' THEN now() ELSE NULL END
  )
  RETURNING id INTO v_transfer_id;

  -- In-app notification for sender
  INSERT INTO public.user_notifications (user_id, title, message, type, priority, related_id, related_type)
  VALUES (
    p_sender_id,
    CASE WHEN v_requires_dual THEN 'Cross-Bank Transfer Pending Review'
         ELSE 'Cross-Bank Transfer Sent' END,
    CASE WHEN v_requires_dual
      THEN 'Your $' || p_amount::text || ' transfer to ' || p_recipient_name || ' is awaiting admin approval (transfers $50,000+).'
      ELSE 'You sent $' || p_amount::text || ' to ' || p_recipient_name || ' at ' || upper(p_partner_bank) || '.'
    END,
    'transfer',
    CASE WHEN v_requires_dual THEN 'high' ELSE 'normal' END,
    v_transfer_id,
    'cross_bank_transfer'
  );

  RETURN jsonb_build_object(
    'success', true,
    'transferId', v_transfer_id,
    'status', v_status,
    'requiresDualApproval', v_requires_dual,
    'newBalance', CASE WHEN v_requires_dual THEN v_sender.balance ELSE v_sender.balance - p_amount END,
    'heldAmount', CASE WHEN v_requires_dual THEN COALESCE(v_sender.held_amount,0) + p_amount ELSE COALESCE(v_sender.held_amount,0) END
  );
END;
$$;

-- Helper: finalize a held transfer once both sides have approved
CREATE OR REPLACE FUNCTION public.complete_cross_bank_transfer_if_ready(p_transfer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_t RECORD;
BEGIN
  SELECT * INTO v_t
  FROM public.cross_bank_transfers
  WHERE id = p_transfer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Transfer not found');
  END IF;

  IF v_t.status <> 'pending' THEN
    RETURN jsonb_build_object('success', true, 'status', v_t.status, 'note', 'already finalized');
  END IF;

  IF v_t.requires_dual_approval AND
     (v_t.heritage_approved_at IS NULL OR v_t.acfcu_approved_at IS NULL) THEN
    RETURN jsonb_build_object('success', true, 'status', 'pending', 'note', 'awaiting other side');
  END IF;

  -- Release hold and debit
  UPDATE public.accounts
  SET held_amount = GREATEST(COALESCE(held_amount,0) - v_t.amount, 0),
      balance = balance - v_t.amount,
      updated_at = now()
  WHERE id = v_t.from_account_id;

  UPDATE public.cross_bank_transfers
  SET status = 'completed',
      completed_at = now(),
      updated_at = now()
  WHERE id = p_transfer_id;

  INSERT INTO public.user_notifications (user_id, title, message, type, priority, related_id, related_type)
  VALUES (
    v_t.user_id,
    'Cross-Bank Transfer Completed',
    'Your $' || v_t.amount::text || ' transfer to ' || COALESCE(v_t.recipient_name,'recipient') || ' has been approved and completed.',
    'transfer', 'high', p_transfer_id, 'cross_bank_transfer'
  );

  RETURN jsonb_build_object('success', true, 'status', 'completed');
END;
$$;

-- Decline helper: refund the hold
CREATE OR REPLACE FUNCTION public.decline_cross_bank_transfer(p_transfer_id uuid, p_reason text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_t RECORD;
BEGIN
  SELECT * INTO v_t FROM public.cross_bank_transfers WHERE id = p_transfer_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Transfer not found');
  END IF;
  IF v_t.status <> 'pending' THEN
    RETURN jsonb_build_object('error', 'Only pending transfers can be declined');
  END IF;

  -- Release any hold
  IF v_t.requires_dual_approval THEN
    UPDATE public.accounts
    SET held_amount = GREATEST(COALESCE(held_amount,0) - v_t.amount, 0),
        updated_at = now()
    WHERE id = v_t.from_account_id;
  END IF;

  UPDATE public.cross_bank_transfers
  SET status = 'declined',
      declined_reason = p_reason,
      updated_at = now()
  WHERE id = p_transfer_id;

  INSERT INTO public.user_notifications (user_id, title, message, type, priority, related_id, related_type)
  VALUES (
    v_t.user_id,
    'Cross-Bank Transfer Declined',
    'Your $' || v_t.amount::text || ' transfer was declined: ' || p_reason,
    'transfer', 'high', p_transfer_id, 'cross_bank_transfer'
  );

  RETURN jsonb_build_object('success', true, 'status', 'declined');
END;
$$;
