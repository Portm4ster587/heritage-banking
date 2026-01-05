-- Create admin crypto wallets table for deposit addresses
CREATE TABLE public.admin_crypto_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  currency VARCHAR(10) NOT NULL,
  currency_name VARCHAR(50) NOT NULL,
  wallet_address TEXT NOT NULL,
  network VARCHAR(50) DEFAULT 'mainnet',
  is_active BOOLEAN DEFAULT true,
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(currency)
);

-- Enable RLS
ALTER TABLE public.admin_crypto_wallets ENABLE ROW LEVEL SECURITY;

-- Everyone can view active wallets (for deposits)
CREATE POLICY "Anyone can view active crypto wallets"
ON public.admin_crypto_wallets
FOR SELECT
USING (is_active = true);

-- Admins can manage all wallets
CREATE POLICY "Admins can manage crypto wallets"
ON public.admin_crypto_wallets
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default wallets (admin will update addresses)
INSERT INTO public.admin_crypto_wallets (currency, currency_name, wallet_address, network) VALUES
('BTC', 'Bitcoin', 'pending_admin_setup', 'mainnet'),
('ETH', 'Ethereum', 'pending_admin_setup', 'mainnet'),
('USDT', 'Tether (ERC-20)', 'pending_admin_setup', 'ethereum'),
('USDC', 'USD Coin', 'pending_admin_setup', 'ethereum'),
('LTC', 'Litecoin', 'pending_admin_setup', 'mainnet'),
('BNB', 'Binance Coin', 'pending_admin_setup', 'bsc');

-- Create check_deposit table for mobile check deposits
CREATE TABLE public.check_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  amount NUMERIC NOT NULL,
  check_front_url TEXT,
  check_back_url TEXT,
  check_number VARCHAR(20),
  payer_name VARCHAR(100),
  bank_name VARCHAR(100),
  routing_number VARCHAR(9),
  status VARCHAR(20) DEFAULT 'pending',
  admin_notes TEXT,
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.check_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own check deposits"
ON public.check_deposits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create check deposits"
ON public.check_deposits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all check deposits"
ON public.check_deposits FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create wire_transfers table
CREATE TABLE public.wire_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  from_account_id UUID NOT NULL REFERENCES public.accounts(id),
  amount NUMERIC NOT NULL,
  transfer_type VARCHAR(20) NOT NULL, -- 'domestic' or 'international'
  recipient_name VARCHAR(100) NOT NULL,
  recipient_bank VARCHAR(100) NOT NULL,
  recipient_routing VARCHAR(11),
  recipient_account VARCHAR(34) NOT NULL,
  recipient_swift VARCHAR(11),
  recipient_address TEXT,
  purpose TEXT,
  reference_number VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending',
  fee_amount NUMERIC DEFAULT 0,
  admin_notes TEXT,
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.wire_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wire transfers"
ON public.wire_transfers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create wire transfers"
ON public.wire_transfers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all wire transfers"
ON public.wire_transfers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create ACH transfers table
CREATE TABLE public.ach_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  external_bank_id UUID REFERENCES public.external_bank_accounts(id),
  transfer_direction VARCHAR(10) NOT NULL, -- 'inbound' or 'outbound'
  amount NUMERIC NOT NULL,
  ach_type VARCHAR(20) DEFAULT 'standard', -- 'standard' or 'same_day'
  status VARCHAR(20) DEFAULT 'pending',
  scheduled_date DATE,
  effective_date DATE,
  reference_number VARCHAR(20),
  description TEXT,
  admin_notes TEXT,
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ach_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ACH transfers"
ON public.ach_transfers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create ACH transfers"
ON public.ach_transfers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all ACH transfers"
ON public.ach_transfers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add username to profiles if not exists and ensure proper defaults
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
    ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;
  END IF;
END $$;

-- Create admin accounts insert policy for creating user accounts
CREATE POLICY "Admins can insert accounts"
ON public.accounts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Update updated_at trigger for new tables
CREATE OR REPLACE FUNCTION public.update_admin_crypto_wallets_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_crypto_wallets_updated_at
BEFORE UPDATE ON public.admin_crypto_wallets
FOR EACH ROW EXECUTE FUNCTION public.update_admin_crypto_wallets_timestamp();