-- Create premium user account for Invest Group Overseas LTD
-- First, we'll set up the profile, accounts, cards, crypto wallets, and transaction history

-- Create function to set up premium investment accounts
CREATE OR REPLACE FUNCTION public.setup_invest_group_overseas_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_checking_id uuid;
  v_investing_id uuid;
  v_business_id uuid;
  v_savings_id uuid;
BEGIN
  -- Get or create user by looking up existing auth user with this email pattern
  -- We'll need to insert profile data for this user
  v_user_id := gen_random_uuid();
  
  -- Insert profile for the investment company
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
    
  -- Create Heritage Investing Account - $567,098,000
  v_investing_id := gen_random_uuid();
  INSERT INTO public.accounts (id, user_id, account_number, routing_number, account_type, balance, status)
  VALUES (
    v_investing_id,
    v_user_id,
    'INV-' || substr(md5(random()::text), 1, 8),
    '021000021',
    'Heritage Investing',
    567098000,
    'active'
  );
  
  -- Create Heritage Business Account - $700,678,000
  v_business_id := gen_random_uuid();
  INSERT INTO public.accounts (id, user_id, account_number, routing_number, account_type, balance, status)
  VALUES (
    v_business_id,
    v_user_id,
    'BUS-' || substr(md5(random()::text), 1, 8),
    '021000021',
    'Heritage Business',
    700678000,
    'active'
  );
  
  -- Create Premium Checking Account
  v_checking_id := gen_random_uuid();
  INSERT INTO public.accounts (id, user_id, account_number, routing_number, account_type, balance, status)
  VALUES (
    v_checking_id,
    v_user_id,
    'CHK-' || substr(md5(random()::text), 1, 8),
    '021000021',
    'Premium Checking',
    25000000,
    'active'
  );
  
  -- Create High Yield Savings Account
  v_savings_id := gen_random_uuid();
  INSERT INTO public.accounts (id, user_id, account_number, routing_number, account_type, balance, status)
  VALUES (
    v_savings_id,
    v_user_id,
    'SAV-' || substr(md5(random()::text), 1, 8),
    '021000021',
    'High Yield Savings',
    85000000,
    'active'
  );
  
  -- Create 5 Premium Credit Cards
  INSERT INTO public.cards (user_id, account_id, card_number, card_type, card_network, expiry_date, cvv, last4, credit_limit, available_credit, status, activation_status)
  VALUES 
    (v_user_id, v_checking_id, '4532' || lpad(floor(random() * 1000000000000)::text, 12, '0'), 'Platinum Business', 'VISA', '12/29', '789', '4532', 500000, 485000, 'active', 'activated'),
    (v_user_id, v_checking_id, '5412' || lpad(floor(random() * 1000000000000)::text, 12, '0'), 'World Elite', 'Mastercard', '06/28', '456', '5412', 1000000, 920000, 'active', 'activated'),
    (v_user_id, v_investing_id, '3782' || lpad(floor(random() * 1000000000000)::text, 12, '0'), 'Centurion', 'Amex', '09/27', '1234', '3782', 2000000, 1850000, 'active', 'activated'),
    (v_user_id, v_business_id, '6011' || lpad(floor(random() * 1000000000000)::text, 12, '0'), 'Business Rewards', 'Discover', '03/28', '567', '6011', 750000, 680000, 'active', 'activated'),
    (v_user_id, v_business_id, '4916' || lpad(floor(random() * 1000000000000)::text, 12, '0'), 'Infinite Privilege', 'VISA', '11/29', '890', '4916', 3000000, 2750000, 'active', 'activated');
    
  -- Create Crypto Wallets - Total $18M+ (BTC $12M+, rest distributed)
  INSERT INTO public.crypto_wallets (user_id, asset_symbol, balance, wallet_address)
  VALUES 
    (v_user_id, 'BTC', 280.5, 'bc1q' || substr(md5(random()::text), 1, 32)),  -- ~$12M+ at $42k/BTC
    (v_user_id, 'ETH', 1250.75, '0x' || substr(md5(random()::text), 1, 40)),  -- ~$2.8M at $2.2k/ETH
    (v_user_id, 'USDT', 1500000, 'T' || substr(md5(random()::text), 1, 33)),  -- $1.5M
    (v_user_id, 'USDC', 800000, '0x' || substr(md5(random()::text), 1, 40)),  -- $800K
    (v_user_id, 'SOL', 12500, substr(md5(random()::text), 1, 44)),            -- ~$1.25M at $100/SOL
    (v_user_id, 'XRP', 450000, 'r' || substr(md5(random()::text), 1, 33));    -- ~$270K at $0.60/XRP

END;
$$;

-- Note: The actual user creation with email invest@igoae.com and password must be done through Auth
-- This function sets up all the account data once the user is created