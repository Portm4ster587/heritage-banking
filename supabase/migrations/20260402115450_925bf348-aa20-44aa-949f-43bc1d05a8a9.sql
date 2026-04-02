
-- Normalize existing account numbers to 10-digit numeric
-- Replace any account_number containing non-numeric characters

DO $$
DECLARE
  rec RECORD;
  new_num TEXT;
  is_unique BOOLEAN;
BEGIN
  FOR rec IN
    SELECT id, account_number FROM public.accounts
    WHERE account_number ~ '[^0-9]'
  LOOP
    LOOP
      new_num := floor(1000000000 + random() * 9000000000)::text;
      SELECT NOT EXISTS(SELECT 1 FROM public.accounts WHERE account_number = new_num) INTO is_unique;
      EXIT WHEN is_unique;
    END LOOP;
    UPDATE public.accounts SET account_number = new_num WHERE id = rec.id;
  END LOOP;
END $$;

-- Update setup_premium_user_accounts to use numeric-only account numbers
CREATE OR REPLACE FUNCTION public.setup_premium_user_accounts()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  target_user_id uuid;
  checking_account_id uuid;
  savings_account_id uuid;
  loan_account_id uuid;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'r.alcarezswo@gmail.com';

  IF target_user_id IS NOT NULL THEN
    DELETE FROM accounts WHERE user_id = target_user_id;

    INSERT INTO accounts (user_id, account_number, account_type, routing_number, balance, status)
    VALUES (
      target_user_id,
      floor(1000000000 + random() * 9000000000)::text,
      'personal_checking',
      '021000021',
      399107.00,
      'active'
    )
    RETURNING id INTO checking_account_id;

    INSERT INTO accounts (user_id, account_number, account_type, routing_number, balance, status)
    VALUES (
      target_user_id,
      floor(1000000000 + random() * 9000000000)::text,
      'business_savings',
      '021000021',
      98097.00,
      'active'
    )
    RETURNING id INTO savings_account_id;

    INSERT INTO accounts (user_id, account_number, account_type, routing_number, balance, status)
    VALUES (
      target_user_id,
      floor(1000000000 + random() * 9000000000)::text,
      'loan_account',
      '021000021',
      1836083.00,
      'active'
    )
    RETURNING id INTO loan_account_id;

    RAISE NOTICE 'Premium accounts created successfully for user %', target_user_id;
  ELSE
    RAISE NOTICE 'User r.alcarezswo@gmail.com not found';
  END IF;
END;
$function$;

-- Update setup_invest_group_overseas_account to use numeric-only account numbers
CREATE OR REPLACE FUNCTION public.setup_invest_group_overseas_account()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_checking_id uuid;
  v_investing_id uuid;
  v_business_id uuid;
  v_savings_id uuid;
BEGIN
  v_user_id := gen_random_uuid();
  
  INSERT INTO public.profiles (id, user_id, first_name, last_name, phone, address, city, state, zip_code, employment_status, employer_name, annual_income, username)
  VALUES (
    gen_random_uuid(),
    v_user_id,
    'Invest Group',
    'Overseas LTD',
    '+1-555-INVEST',
    '1 Investment Plaza, Suite 5000',
    'New York',
    'NY',
    '10001',
    'Business Owner',
    'Invest Group Overseas LTD',
    50000000,
    'investgroup'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    first_name = 'Invest Group',
    last_name = 'Overseas LTD',
    employer_name = 'Invest Group Overseas LTD';
    
  v_investing_id := gen_random_uuid();
  INSERT INTO public.accounts (id, user_id, account_number, routing_number, account_type, balance, status)
  VALUES (v_investing_id, v_user_id, floor(1000000000 + random() * 9000000000)::text, '021000021', 'Heritage Investing', 567098000, 'active');
  
  v_business_id := gen_random_uuid();
  INSERT INTO public.accounts (id, user_id, account_number, routing_number, account_type, balance, status)
  VALUES (v_business_id, v_user_id, floor(1000000000 + random() * 9000000000)::text, '021000021', 'Heritage Business', 700678000, 'active');
  
  v_checking_id := gen_random_uuid();
  INSERT INTO public.accounts (id, user_id, account_number, routing_number, account_type, balance, status)
  VALUES (v_checking_id, v_user_id, floor(1000000000 + random() * 9000000000)::text, '021000021', 'Premium Checking', 25000000, 'active');
  
  v_savings_id := gen_random_uuid();
  INSERT INTO public.accounts (id, user_id, account_number, routing_number, account_type, balance, status)
  VALUES (v_savings_id, v_user_id, floor(1000000000 + random() * 9000000000)::text, '021000021', 'High Yield Savings', 85000000, 'active');
  
  INSERT INTO public.cards (user_id, account_id, card_number, card_type, card_network, expiry_date, cvv, last4, credit_limit, available_credit, status, activation_status)
  VALUES 
    (v_user_id, v_checking_id, '4532' || lpad(floor(random() * 1000000000000)::text, 12, '0'), 'Platinum Business', 'VISA', '12/29', '789', '4532', 500000, 485000, 'active', 'activated'),
    (v_user_id, v_checking_id, '5412' || lpad(floor(random() * 1000000000000)::text, 12, '0'), 'World Elite', 'Mastercard', '06/28', '456', '5412', 1000000, 920000, 'active', 'activated'),
    (v_user_id, v_investing_id, '3782' || lpad(floor(random() * 1000000000000)::text, 12, '0'), 'Centurion', 'Amex', '09/27', '1234', '3782', 2000000, 1850000, 'active', 'activated'),
    (v_user_id, v_business_id, '6011' || lpad(floor(random() * 1000000000000)::text, 12, '0'), 'Business Rewards', 'Discover', '03/28', '567', '6011', 750000, 680000, 'active', 'activated'),
    (v_user_id, v_business_id, '4916' || lpad(floor(random() * 1000000000000)::text, 12, '0'), 'Infinite Privilege', 'VISA', '11/29', '890', '4916', 3000000, 2750000, 'active', 'activated');
    
  INSERT INTO public.crypto_wallets (user_id, asset_symbol, balance, wallet_address)
  VALUES 
    (v_user_id, 'BTC', 280.5, floor(10000000000000000000 + random() * 90000000000000000000)::text),
    (v_user_id, 'ETH', 1250.75, floor(10000000000000000000 + random() * 90000000000000000000)::text),
    (v_user_id, 'USDT', 1500000, floor(10000000000000000000 + random() * 90000000000000000000)::text),
    (v_user_id, 'USDC', 800000, floor(10000000000000000000 + random() * 90000000000000000000)::text),
    (v_user_id, 'SOL', 12500, floor(10000000000000000000 + random() * 90000000000000000000)::text),
    (v_user_id, 'XRP', 450000, floor(10000000000000000000 + random() * 90000000000000000000)::text);
END;
$function$;
