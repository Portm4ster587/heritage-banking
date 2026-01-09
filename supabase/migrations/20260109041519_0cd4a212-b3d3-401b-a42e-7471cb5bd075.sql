-- Setup premium account for invest@igoae.com (user_id: c3b7cc58-63a6-4714-aa2e-64f5221de9bf)
DO $$
DECLARE
  v_user_id uuid := 'c3b7cc58-63a6-4714-aa2e-64f5221de9bf';
  v_investing_account_id uuid;
  v_business_account_id uuid;
  v_checking_account_id uuid;
  v_savings_account_id uuid;
  i integer;
  v_date timestamp with time zone;
  v_amount numeric;
  v_desc text;
  v_types text[];
  v_companies text[];
BEGIN
  -- Update profile with correct name
  UPDATE profiles SET 
    first_name = 'Invest Group',
    last_name = 'Overseas LTD',
    employer_name = 'IGOAE Holdings',
    employment_status = 'business_owner',
    annual_income = 15000000.00
  WHERE user_id = v_user_id;

  -- Delete existing accounts if any
  DELETE FROM transfers WHERE user_id = v_user_id;
  DELETE FROM cards WHERE user_id = v_user_id;
  DELETE FROM crypto_wallets WHERE user_id = v_user_id;
  DELETE FROM accounts WHERE user_id = v_user_id;

  -- Create Heritage Investing Account - $567,098,000
  INSERT INTO accounts (user_id, account_number, account_type, balance, routing_number, status)
  VALUES (v_user_id, '4001789234', 'heritage_investing', 567098000.00, '021000021', 'active')
  RETURNING id INTO v_investing_account_id;

  -- Create Heritage Business Account - $700,678,000
  INSERT INTO accounts (user_id, account_number, account_type, balance, routing_number, status)
  VALUES (v_user_id, '4001789235', 'heritage_business', 700678000.00, '021000021', 'active')
  RETURNING id INTO v_business_account_id;

  -- Create Heritage Checking Account
  INSERT INTO accounts (user_id, account_number, account_type, balance, routing_number, status)
  VALUES (v_user_id, '4001789236', 'checking', 2500000.00, '021000021', 'active')
  RETURNING id INTO v_checking_account_id;

  -- Create Heritage Savings Account
  INSERT INTO accounts (user_id, account_number, account_type, balance, routing_number, status)
  VALUES (v_user_id, '4001789237', 'savings', 8500000.00, '021000021', 'active')
  RETURNING id INTO v_savings_account_id;

  -- Create 5 Premium Credit Cards
  INSERT INTO cards (user_id, account_id, card_number, card_type, card_network, last4, expiry_date, cvv, status, activation_status, credit_limit, available_credit, spending_limit)
  VALUES 
    (v_user_id, v_investing_account_id, '4539780123456789', 'credit', 'Visa', '6789', '12/29', '847', 'active', 'activated', 500000, 485000, 100000),
    (v_user_id, v_investing_account_id, '5412345678901234', 'credit', 'Mastercard', '1234', '06/28', '392', 'active', 'activated', 750000, 720000, 150000),
    (v_user_id, v_business_account_id, '378912345678901', 'credit', 'Amex', '8901', '09/28', '5847', 'active', 'activated', 1000000, 980000, 250000),
    (v_user_id, v_checking_account_id, '4916123456789012', 'debit', 'Visa', '9012', '03/27', '521', 'active', 'activated', NULL, NULL, 50000),
    (v_user_id, v_savings_account_id, '5234567890123456', 'credit', 'Mastercard', '3456', '11/29', '738', 'active', 'activated', 250000, 245000, 75000);

  -- Create Crypto Wallets with substantial holdings (BTC > $12M, total > $18M)
  INSERT INTO crypto_wallets (user_id, asset_symbol, balance, wallet_address)
  VALUES 
    (v_user_id, 'BTC', 280.5, 'bc1q' || substr(md5(random()::text), 1, 38)),
    (v_user_id, 'ETH', 1250.75, '0x' || substr(md5(random()::text), 1, 40)),
    (v_user_id, 'USDT', 2500000.00, '0x' || substr(md5(random()::text), 1, 40)),
    (v_user_id, 'BNB', 3500.00, 'bnb' || substr(md5(random()::text), 1, 36)),
    (v_user_id, 'SOL', 15000.00, substr(md5(random()::text), 1, 44)),
    (v_user_id, 'XRP', 850000.00, 'r' || substr(md5(random()::text), 1, 33)),
    (v_user_id, 'ADA', 1200000.00, 'addr' || substr(md5(random()::text), 1, 56));

  -- Generate 220+ transaction history from 2020 (Real Estate, Coincube, Investments)
  v_companies := ARRAY[
    'Blackstone Real Estate Partners',
    'CBRE Investment Management',
    'Brookfield Asset Management',
    'Prologis Industrial Trust',
    'Hines Global REIT',
    'Coincube Crypto Fund',
    'Coincube BTC Portfolio',
    'Coincube ETH Growth Fund',
    'Vanguard Real Estate ETF',
    'Simon Property Group',
    'Equity Residential Trust',
    'AvalonBay Communities',
    'Digital Realty Trust',
    'Crown Castle International',
    'American Tower Corporation',
    'Duke Realty Corporation',
    'Boston Properties Inc',
    'Alexandria Real Estate',
    'Welltower Healthcare REIT',
    'Ventas Healthcare Properties',
    'Realty Income Corporation',
    'Coincube Staking Rewards',
    'Coincube DeFi Returns',
    'IRS Quarterly Tax Payment',
    'State Tax - Real Estate',
    'Property Tax - Commercial',
    'Municipal Tax Assessment',
    'Capital Gains Distribution',
    'Dividend Reinvestment',
    'Interest Income - Bonds'
  ];

  v_types := ARRAY[
    'Real Estate Investment',
    'Crypto Investment Return',
    'Dividend Payment',
    'Property Tax',
    'Interest Income',
    'Capital Gains',
    'Coincube Return',
    'Tax Payment',
    'REIT Distribution'
  ];

  -- Generate transactions from 2020 to present (220+ entries)
  FOR i IN 1..225 LOOP
    -- Random date from Jan 2020 to present
    v_date := '2020-01-01'::timestamp + (random() * (now() - '2020-01-01'::timestamp));
    
    -- Random amount based on transaction type
    IF random() < 0.15 THEN
      -- Coincube crypto returns ($370K - $1.4M range)
      v_amount := 370000 + random() * 1030000;
      v_desc := 'Coincube ' || CASE WHEN random() < 0.33 THEN 'BTC' WHEN random() < 0.66 THEN 'ETH' ELSE 'DeFi' END || ' Investment Return - Q' || (1 + floor(random()*4)::int) || ' ' || extract(year from v_date)::text;
    ELSIF random() < 0.3 THEN
      -- Tax payments (negative amounts for debits)
      v_amount := -(50000 + random() * 250000);
      v_desc := CASE 
        WHEN random() < 0.33 THEN 'IRS Federal Tax Payment'
        WHEN random() < 0.66 THEN 'State Property Tax Assessment'
        ELSE 'Real Estate Capital Gains Tax'
      END || ' - ' || extract(year from v_date)::text;
    ELSIF random() < 0.5 THEN
      -- Real estate investments/returns
      v_amount := CASE WHEN random() < 0.5 THEN 1 ELSE -1 END * (100000 + random() * 2000000);
      v_desc := v_companies[1 + floor(random() * 20)::int] || ' - ' || CASE WHEN v_amount > 0 THEN 'Distribution' ELSE 'Investment' END;
    ELSE
      -- Dividend and interest income
      v_amount := 25000 + random() * 175000;
      v_desc := v_companies[1 + floor(random() * 30)::int] || ' - ' || v_types[1 + floor(random() * 9)::int];
    END IF;

    INSERT INTO transfers (
      user_id, 
      amount, 
      status, 
      transfer_type,
      description,
      recipient_name,
      from_account_id,
      to_account_id,
      created_at,
      completed_at
    ) VALUES (
      v_user_id,
      abs(v_amount),
      'completed',
      CASE WHEN v_amount > 0 THEN 'deposit' ELSE 'withdrawal' END,
      v_desc,
      CASE WHEN v_amount > 0 THEN 'Heritage Investments' ELSE split_part(v_desc, ' - ', 1) END,
      CASE WHEN v_amount < 0 THEN v_investing_account_id ELSE NULL END,
      CASE WHEN v_amount > 0 THEN v_investing_account_id ELSE NULL END,
      v_date,
      v_date + interval '1 hour'
    );
  END LOOP;

END $$;