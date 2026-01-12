# Heritage Bank - Setup Instructions

## Default Login Accounts

### User Account
- **Username**: `user`
- **Password**: `user`
- **Account Details**:
  - Personal Checking: $25,000
  - Personal Savings: $50,000
  - Crypto Wallets:
    - BTC: 0.5
    - ETH: 5.0
    - USDT: 10,000
    - BNB: 25.0

### Admin Account  
- **Email**: `admin@heritagebank.com`
- **Password**: `00009999`
- **Username**: `admin` (for login with username)
- **Access**: Full administrative panel with user management, transaction oversight, balance editing, and account control

### Investment Account (Demo)
- **Email**: `invest@igoae.com`
- **Password**: `000999`
- **Account Details**:
  - Heritage Investing: $567,098,000
  - Heritage Business: $700,678,000
  - Premium Checking: $25,000,000
  - High Yield Savings: $85,000,000
  - 5 Premium Credit Cards (Platinum, World Elite, Centurion, Business Rewards, Infinite Privilege)
  - Crypto Portfolio: $18M+ (BTC, ETH, USDT, USDC, SOL, XRP)
  - 200+ Transaction History since 2020 (Real Estate, Coincube, Taxes, etc.)

## Creating Default Accounts

Since the accounts need to be created through Supabase Auth, follow these steps:

### Method 1: Using Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/jiahyspsvgfvyvgoffwr
2. Navigate to **Authentication** → **Users**
3. Click **Add user** (dropdown) → **Create new user**

**For User Account:**
- Email: `user@heritagebank.com`
- Password: `user`
- Email Confirm: ✓ (checked)
- Auto Confirm User: ✓ (checked)

**For Admin Account:**
- Email: `admin@heritagebank.com`
- Password: `Admin123`
- Email Confirm: ✓ (checked)
- Auto Confirm User: ✓ (checked)

### Method 2: Using SQL (After creating auth users)

After creating the users through the dashboard, run this SQL in the **SQL Editor**:

```sql
-- Get the user IDs
DO $$
DECLARE
  default_user_id uuid;
  admin_user_id uuid;
  checking_account_id uuid;
  savings_account_id uuid;
BEGIN
  -- Get user IDs from auth.users
  SELECT id INTO default_user_id FROM auth.users WHERE email = 'user@heritagebank.com';
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@heritagebank.com';

  -- Set up default user profile and accounts
  IF default_user_id IS NOT NULL THEN
    -- Create profile with username
    INSERT INTO public.profiles (user_id, first_name, last_name, username)
    VALUES (default_user_id, 'Default', 'User', 'user')
    ON CONFLICT (user_id) DO UPDATE SET username = 'user';

    -- Assign user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (default_user_id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Delete existing accounts if any
    DELETE FROM public.accounts WHERE user_id = default_user_id;
    DELETE FROM public.crypto_wallets WHERE user_id = default_user_id;

    -- Create Checking Account
    INSERT INTO public.accounts (user_id, account_number, account_type, routing_number, balance, status)
    VALUES (
      default_user_id,
      'CHK' || floor(random() * 900000000 + 100000000)::text,
      'personal_checking',
      '021000021',
      25000.00,
      'active'
    );

    -- Create Savings Account
    INSERT INTO public.accounts (user_id, account_number, account_type, routing_number, balance, status)
    VALUES (
      default_user_id,
      'SAV' || floor(random() * 900000000 + 100000000)::text,
      'personal_savings',
      '021000021',
      50000.00,
      'active'
    );

    -- Create crypto wallets
    INSERT INTO public.crypto_wallets (user_id, asset_symbol, balance, wallet_address)
    VALUES 
      (default_user_id, 'BTC', 0.5, 'bc1q' || substr(md5(random()::text), 1, 38)),
      (default_user_id, 'ETH', 5.0, '0x' || substr(md5(random()::text), 1, 40)),
      (default_user_id, 'USDT', 10000.0, '0x' || substr(md5(random()::text), 1, 40)),
      (default_user_id, 'BNB', 25.0, '0x' || substr(md5(random()::text), 1, 40));

    RAISE NOTICE 'Default user account setup complete';
  END IF;

  -- Set up admin profile
  IF admin_user_id IS NOT NULL THEN
    -- Create profile with username
    INSERT INTO public.profiles (user_id, first_name, last_name, username)
    VALUES (admin_user_id, 'Admin', 'User', 'admin')
    ON CONFLICT (user_id) DO UPDATE SET username = 'admin';

    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Admin account setup complete';
  END IF;
END $$;
```

## Features Implemented

### Authentication
- ✅ Username/Password login (replaces email login)
- ✅ Support for both username and email login
- ✅ Animated loading screens
- ✅ Secure session management

### User Dashboard
- ✅ Account overview with real-time balances
- ✅ Crypto wallet integration with real balances
- ✅ Transaction history
- ✅ Transfer capabilities
- ✅ Deposit/Withdrawal requests

### Admin Panel
- ✅ User management with search
- ✅ Account status control (Active/Hold/Frozen)
- ✅ Balance adjustments
- ✅ Deposit request approval/rejection
- ✅ Withdrawal request processing
- ✅ Transaction monitoring
- ✅ Application review system
- ✅ Real-time notifications

### Account Management Actions
- **Hold**: Temporarily restricts account access
- **Frozen**: Completely locks the account
- **Active**: Normal account operation
- **Balance Adjustment**: Add or deduct funds with notes

## Admin Panel Access

Navigate to `/dashboard` after logging in with admin credentials. The admin panel provides:

1. **Overview Tab**: Summary of pending requests and recent activity
2. **Users Tab**: Complete user management with account controls
3. **Applications Tab**: Review new account applications
4. **Notifications Tab**: System alerts and important events
5. **Deposits Tab**: Process deposit requests
6. **Withdraws Tab**: Handle withdrawal requests
7. **Transactions Tab**: Monitor all system transactions

## Testing

1. **Login as User**:
   - Use `user` / `user`
   - Check account balances
   - View crypto wallets
   - Make a transfer or deposit request

2. **Login as Admin**:
   - Use `admin` / `Admin123`
   - Review and approve/reject requests
   - Adjust account balances
   - Freeze/unfreeze accounts
   - Monitor all system activity

## Security Notes

- All RLS policies are properly configured
- Admin actions are logged with user ID and timestamp
- Passwords are securely hashed
- Session management uses Supabase's secure implementation
- Username lookup function uses SECURITY DEFINER for safe queries

## Troubleshooting

If you can't log in:
1. Check that users were created in Supabase Auth
2. Ensure email confirmation is disabled for testing
3. Verify the users have the correct roles in `user_roles` table
4. Run the SQL script above to set up profiles and accounts
