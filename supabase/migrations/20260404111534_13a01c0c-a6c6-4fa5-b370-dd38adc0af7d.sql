
-- Fix 1: Remove CVV column (PCI-DSS: CVV must never be stored)
ALTER TABLE public.cards DROP COLUMN IF EXISTS cvv;

-- Fix 2: Mask card_number - keep only hashed/tokenized form, real display uses last4
-- Update existing card numbers to masked form (keep first 4 and last 4, mask middle)
UPDATE public.cards 
SET card_number = SUBSTRING(card_number FROM 1 FOR 4) || '********' || last4
WHERE LENGTH(card_number) > 8;

-- Fix 3: Create atomic transfer function for heritage internal transfers
CREATE OR REPLACE FUNCTION public.process_heritage_transfer(
  p_sender_id uuid,
  p_from_account_id uuid,
  p_recipient_account_number text,
  p_amount numeric,
  p_memo text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_account RECORD;
  v_recipient_account RECORD;
  v_sender_profile RECORD;
  v_recipient_profile RECORD;
  v_sender_name text;
  v_recipient_name text;
  v_transaction_id text;
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('error', 'Invalid amount');
  END IF;

  -- Lock sender account row to prevent race conditions
  SELECT id, user_id, balance, account_number, account_type
  INTO v_sender_account
  FROM public.accounts
  WHERE id = p_from_account_id AND user_id = p_sender_id AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Source account not found');
  END IF;

  IF (v_sender_account.balance) < p_amount THEN
    RETURN jsonb_build_object('error', 'Insufficient funds');
  END IF;

  -- Lock recipient account row
  SELECT id, user_id, balance, account_number, account_type
  INTO v_recipient_account
  FROM public.accounts
  WHERE account_number = p_recipient_account_number AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Recipient account not found');
  END IF;

  IF v_recipient_account.user_id = p_sender_id THEN
    RETURN jsonb_build_object('error', 'Cannot transfer to your own account');
  END IF;

  -- Get profiles
  SELECT first_name, last_name INTO v_sender_profile FROM public.profiles WHERE user_id = p_sender_id;
  SELECT first_name, last_name INTO v_recipient_profile FROM public.profiles WHERE user_id = v_recipient_account.user_id;

  v_sender_name := COALESCE(TRIM(COALESCE(v_sender_profile.first_name, '') || ' ' || COALESCE(v_sender_profile.last_name, '')), 'Heritage Member');
  v_recipient_name := COALESCE(TRIM(COALESCE(v_recipient_profile.first_name, '') || ' ' || COALESCE(v_recipient_profile.last_name, '')), 'Heritage Member');
  IF v_sender_name = '' THEN v_sender_name := 'Heritage Member'; END IF;
  IF v_recipient_name = '' THEN v_recipient_name := 'Heritage Member'; END IF;

  v_transaction_id := 'HBT' || UPPER(TO_HEX(EXTRACT(EPOCH FROM NOW())::bigint));

  -- Atomic debit and credit
  UPDATE public.accounts SET balance = balance - p_amount WHERE id = v_sender_account.id;
  UPDATE public.accounts SET balance = balance + p_amount WHERE id = v_recipient_account.id;

  -- Create transfer record
  INSERT INTO public.transfers (from_account_id, to_account_id, amount, description, user_id, transfer_type, status, recipient_name, recipient_account, completed_at)
  VALUES (v_sender_account.id, v_recipient_account.id, p_amount, COALESCE(p_memo, 'Heritage Transfer to ' || v_recipient_name), p_sender_id, 'heritage_internal', 'completed', v_recipient_name, p_recipient_account_number, NOW());

  -- Notifications
  INSERT INTO public.user_notifications (user_id, title, message, type, priority)
  VALUES (v_recipient_account.user_id, 'Money Received', 'You received $' || p_amount::text || ' from ' || v_sender_name, 'transfer', 'high');

  INSERT INTO public.user_notifications (user_id, title, message, type, priority)
  VALUES (p_sender_id, 'Transfer Sent', 'You sent $' || p_amount::text || ' to ' || v_recipient_name, 'transfer', 'normal');

  RETURN jsonb_build_object(
    'success', true,
    'transactionId', v_transaction_id,
    'recipientName', v_recipient_name,
    'recipientUserId', v_recipient_account.user_id,
    'newBalance', v_sender_account.balance - p_amount
  );
END;
$$;

-- Fix 4: Create atomic crypto transfer function
CREATE OR REPLACE FUNCTION public.process_crypto_transfer(
  p_sender_id uuid,
  p_sender_wallet_id uuid,
  p_recipient_wallet_address text,
  p_amount numeric,
  p_asset_symbol text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_wallet RECORD;
  v_recipient_wallet RECORD;
  v_sender_profile RECORD;
  v_sender_name text;
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('error', 'Invalid amount');
  END IF;

  -- Lock sender wallet
  SELECT id, user_id, balance, asset_symbol
  INTO v_sender_wallet
  FROM public.crypto_wallets
  WHERE id = p_sender_wallet_id AND user_id = p_sender_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Sender wallet not found');
  END IF;

  IF (v_sender_wallet.balance) < p_amount THEN
    RETURN jsonb_build_object('error', 'Insufficient balance');
  END IF;

  -- Lock recipient wallet
  SELECT id, user_id, balance, asset_symbol
  INTO v_recipient_wallet
  FROM public.crypto_wallets
  WHERE wallet_address = p_recipient_wallet_address
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Recipient wallet not found');
  END IF;

  IF v_recipient_wallet.user_id = p_sender_id THEN
    RETURN jsonb_build_object('error', 'Cannot transfer to yourself');
  END IF;

  -- Get sender profile
  SELECT first_name, last_name INTO v_sender_profile FROM public.profiles WHERE user_id = p_sender_id;
  v_sender_name := COALESCE(TRIM(COALESCE(v_sender_profile.first_name, '') || ' ' || COALESCE(v_sender_profile.last_name, '')), 'Heritage Member');
  IF v_sender_name = '' THEN v_sender_name := 'Heritage Member'; END IF;

  -- Atomic debit and credit
  UPDATE public.crypto_wallets SET balance = balance - p_amount WHERE id = v_sender_wallet.id;
  UPDATE public.crypto_wallets SET balance = balance + p_amount WHERE id = v_recipient_wallet.id;

  -- Notifications
  INSERT INTO public.user_notifications (user_id, title, message, type, priority)
  VALUES (v_recipient_wallet.user_id, p_asset_symbol || ' Received', 'You received ' || p_amount::text || ' ' || p_asset_symbol || ' from ' || v_sender_name || ' via Heritage Ecosystem', 'crypto', 'high');

  INSERT INTO public.user_notifications (user_id, title, message, type, priority)
  VALUES (p_sender_id, p_asset_symbol || ' Sent', 'You sent ' || p_amount::text || ' ' || p_asset_symbol || ' via Heritage Ecosystem', 'crypto', 'normal');

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Successfully transferred ' || p_amount::text || ' ' || p_asset_symbol,
    'recipientUserId', v_recipient_wallet.user_id,
    'newSenderBalance', v_sender_wallet.balance - p_amount
  );
END;
$$;

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION public.process_heritage_transfer FROM anon;
GRANT EXECUTE ON FUNCTION public.process_heritage_transfer TO authenticated;
REVOKE ALL ON FUNCTION public.process_crypto_transfer FROM anon;
GRANT EXECUTE ON FUNCTION public.process_crypto_transfer TO authenticated;
