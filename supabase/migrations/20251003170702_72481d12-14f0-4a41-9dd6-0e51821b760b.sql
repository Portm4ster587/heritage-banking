-- Check and create missing enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_type') THEN
    CREATE TYPE public.application_type AS ENUM (
      'checking', 'savings', 'credit_card', 'personal_loan', 
      'home_loan', 'auto_loan', 'business_loan', 'business'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
    CREATE TYPE public.application_status AS ENUM (
      'pending', 'under_review', 'approved', 'rejected', 'requires_info'
    );
  END IF;
END $$;

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  ssn_last4 TEXT,
  employment_status TEXT,
  employer_name TEXT,
  annual_income DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  application_type application_type NOT NULL,
  status application_status DEFAULT 'pending',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  ssn_last4 TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  employment_status TEXT,
  employer_name TEXT,
  annual_income DECIMAL(15,2),
  monthly_income DECIMAL(15,2),
  loan_amount DECIMAL(15,2),
  loan_purpose TEXT,
  business_name TEXT,
  business_type TEXT,
  business_tax_id TEXT,
  annual_revenue DECIMAL(15,2),
  years_in_business INTEGER,
  review_notes TEXT,
  reviewed_by_admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_type TEXT NOT NULL,
  account_number TEXT UNIQUE NOT NULL,
  routing_number TEXT NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cards table
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_number TEXT NOT NULL,
  card_type TEXT NOT NULL,
  card_network TEXT NOT NULL,
  cvv TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  last4 TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  activation_status TEXT DEFAULT 'pending',
  credit_limit DECIMAL(15,2),
  available_credit DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transfers table
CREATE TABLE IF NOT EXISTS public.transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_account_id UUID REFERENCES public.accounts(id),
  to_account_id UUID REFERENCES public.accounts(id),
  amount DECIMAL(15,2) NOT NULL,
  transfer_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  description TEXT,
  recipient_name TEXT,
  recipient_account TEXT,
  approved_by_admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  provider TEXT,
  account_number TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create crypto_assets table
CREATE TABLE IF NOT EXISTS public.crypto_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  current_price DECIMAL(20,8) NOT NULL,
  price_change_24h DECIMAL(10,2),
  market_cap BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create crypto_wallets table
CREATE TABLE IF NOT EXISTS public.crypto_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_symbol TEXT NOT NULL,
  balance DECIMAL(20,8) DEFAULT 0,
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, asset_symbol)
);

-- Create deposit_requests table
CREATE TABLE IF NOT EXISTS public.deposit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  method TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reference_number TEXT,
  notes TEXT,
  processed_by_admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Create withdraw_requests table
CREATE TABLE IF NOT EXISTS public.withdraw_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  method TEXT NOT NULL,
  destination TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reference_number TEXT,
  notes TEXT,
  processed_by_admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Create admin_notifications table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  related_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdraw_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to recreate them
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Users can view own applications" ON public.applications;
  DROP POLICY IF EXISTS "Users can create own applications" ON public.applications;
  DROP POLICY IF EXISTS "Admins can view all applications" ON public.applications;
  DROP POLICY IF EXISTS "Admins can update applications" ON public.applications;
  DROP POLICY IF EXISTS "Users can view own accounts" ON public.accounts;
  DROP POLICY IF EXISTS "Users can update own accounts" ON public.accounts;
  DROP POLICY IF EXISTS "Admins can manage all accounts" ON public.accounts;
  DROP POLICY IF EXISTS "Users can view own cards" ON public.cards;
  DROP POLICY IF EXISTS "Users can update own cards" ON public.cards;
  DROP POLICY IF EXISTS "Admins can manage all cards" ON public.cards;
  DROP POLICY IF EXISTS "Users can view own transfers" ON public.transfers;
  DROP POLICY IF EXISTS "Users can create transfers" ON public.transfers;
  DROP POLICY IF EXISTS "Admins can manage all transfers" ON public.transfers;
  DROP POLICY IF EXISTS "Users can manage own payment methods" ON public.payment_methods;
  DROP POLICY IF EXISTS "Anyone can view crypto assets" ON public.crypto_assets;
  DROP POLICY IF EXISTS "Admins can manage crypto assets" ON public.crypto_assets;
  DROP POLICY IF EXISTS "Users can manage own crypto wallets" ON public.crypto_wallets;
  DROP POLICY IF EXISTS "Users can view own deposit requests" ON public.deposit_requests;
  DROP POLICY IF EXISTS "Users can create deposit requests" ON public.deposit_requests;
  DROP POLICY IF EXISTS "Admins can manage all deposit requests" ON public.deposit_requests;
  DROP POLICY IF EXISTS "Users can view own withdraw requests" ON public.withdraw_requests;
  DROP POLICY IF EXISTS "Users can create withdraw requests" ON public.withdraw_requests;
  DROP POLICY IF EXISTS "Admins can manage all withdraw requests" ON public.withdraw_requests;
  DROP POLICY IF EXISTS "Admins can manage notifications" ON public.admin_notifications;
END $$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for applications
CREATE POLICY "Users can view own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
  ON public.applications FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications"
  ON public.applications FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for accounts
CREATE POLICY "Users can view own accounts"
  ON public.accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON public.accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all accounts"
  ON public.accounts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for cards
CREATE POLICY "Users can view own cards"
  ON public.cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
  ON public.cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all cards"
  ON public.cards FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for transfers
CREATE POLICY "Users can view own transfers"
  ON public.transfers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create transfers"
  ON public.transfers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transfers"
  ON public.transfers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for payment_methods
CREATE POLICY "Users can manage own payment methods"
  ON public.payment_methods FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for crypto_assets (public read)
CREATE POLICY "Anyone can view crypto assets"
  ON public.crypto_assets FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage crypto assets"
  ON public.crypto_assets FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for crypto_wallets
CREATE POLICY "Users can manage own crypto wallets"
  ON public.crypto_wallets FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for deposit_requests
CREATE POLICY "Users can view own deposit requests"
  ON public.deposit_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create deposit requests"
  ON public.deposit_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all deposit requests"
  ON public.deposit_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for withdraw_requests
CREATE POLICY "Users can view own withdraw requests"
  ON public.withdraw_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create withdraw requests"
  ON public.withdraw_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all withdraw requests"
  ON public.withdraw_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for admin_notifications
CREATE POLICY "Admins can manage notifications"
  ON public.admin_notifications FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON public.accounts;
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_cards_updated_at ON public.cards;
CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON public.payment_methods;
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_crypto_wallets_updated_at ON public.crypto_wallets;
CREATE TRIGGER update_crypto_wallets_updated_at
  BEFORE UPDATE ON public.crypto_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();