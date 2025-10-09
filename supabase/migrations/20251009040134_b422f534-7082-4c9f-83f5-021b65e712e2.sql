-- Update specific user accounts with correct balances
-- This will set up the accounts for r.alcarezswo@gmail.com

-- First, let's create a function to get or create accounts for specific users
CREATE OR REPLACE FUNCTION setup_premium_user_accounts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  checking_account_id uuid;
  savings_account_id uuid;
  loan_account_id uuid;
BEGIN
  -- Find the user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'r.alcarezswo@gmail.com';

  IF target_user_id IS NOT NULL THEN
    -- Delete existing accounts for this user to start fresh
    DELETE FROM accounts WHERE user_id = target_user_id;

    -- Create Personal Checking Account with $399,107
    INSERT INTO accounts (user_id, account_number, account_type, routing_number, balance, status)
    VALUES (
      target_user_id,
      'CHK' || floor(random() * 900000000 + 100000000)::text,
      'personal_checking',
      '123456789',
      399107.00,
      'active'
    )
    RETURNING id INTO checking_account_id;

    -- Create Business Savings Account with $98,097
    INSERT INTO accounts (user_id, account_number, account_type, routing_number, balance, status)
    VALUES (
      target_user_id,
      'SAV' || floor(random() * 900000000 + 100000000)::text,
      'business_savings',
      '123456789',
      98097.00,
      'active'
    )
    RETURNING id INTO savings_account_id;

    -- Create Loan Account with $1,836,083
    INSERT INTO accounts (user_id, account_number, account_type, routing_number, balance, status)
    VALUES (
      target_user_id,
      'LOAN' || floor(random() * 900000000 + 100000000)::text,
      'loan_account',
      '123456789',
      1836083.00,
      'active'
    )
    RETURNING id INTO loan_account_id;

    RAISE NOTICE 'Premium accounts created successfully for user %', target_user_id;
  ELSE
    RAISE NOTICE 'User r.alcarezswo@gmail.com not found';
  END IF;
END;
$$;

-- Execute the function
SELECT setup_premium_user_accounts();