-- Update Invest Group Overseas profile with username 'invest'
UPDATE public.profiles 
SET username = 'invest',
    first_name = 'Invest Group',
    last_name = 'Overseas LTD',
    employer_name = 'Invest Group Overseas LTD',
    annual_income = 500000000
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'invest@igoae.com');

-- Update all accounts for invest user with massive balances (over $12B total)
UPDATE public.accounts 
SET balance = 
  CASE 
    WHEN account_type ILIKE '%checking%' THEN 3500000000
    WHEN account_type ILIKE '%saving%' THEN 2800000000
    WHEN account_type ILIKE '%invest%' THEN 4200000000
    WHEN account_type ILIKE '%business%' THEN 1800000000
    ELSE balance + 500000000
  END
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'invest@igoae.com');