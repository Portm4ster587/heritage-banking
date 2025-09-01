-- Add guest applications support
ALTER TABLE applications ADD COLUMN is_guest BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE applications ALTER COLUMN user_id DROP NOT NULL;

-- Create enhanced cards table features
ALTER TABLE cards ADD COLUMN activation_status TEXT NOT NULL DEFAULT 'inactive';
ALTER TABLE cards ADD COLUMN card_number_encrypted TEXT;
ALTER TABLE cards ADD COLUMN cvv_encrypted TEXT;
ALTER TABLE cards ADD COLUMN activation_code TEXT;

-- Create crypto assets table for real-time rates
CREATE TABLE crypto_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_usd NUMERIC NOT NULL DEFAULT 0,
  price_change_24h NUMERIC NOT NULL DEFAULT 0,
  market_cap NUMERIC,
  volume_24h NUMERIC,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS for crypto_assets
ALTER TABLE crypto_assets ENABLE ROW LEVEL SECURITY;

-- Create policy for crypto_assets (public read access for rates)
CREATE POLICY "Crypto assets are publicly readable" 
ON crypto_assets 
FOR SELECT 
USING (is_active = true);

-- Create wallet addresses table for barcode generation
CREATE TABLE wallet_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  crypto_wallet_id UUID NOT NULL,
  address TEXT NOT NULL,
  qr_code_url TEXT,
  network TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for wallet_addresses
ALTER TABLE wallet_addresses ENABLE ROW LEVEL SECURITY;

-- Create policies for wallet_addresses
CREATE POLICY "Users can view own wallet addresses" 
ON wallet_addresses 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create own wallet addresses" 
ON wallet_addresses 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can manage all wallet addresses" 
ON wallet_addresses 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create payment methods table for merchant integration
CREATE TABLE payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  method_type TEXT NOT NULL, -- 'card', 'bank', 'crypto', 'paypal', etc.
  provider TEXT NOT NULL, -- 'visa', 'mastercard', 'heleket', etc.
  external_id TEXT, -- External provider ID
  details JSONB NOT NULL DEFAULT '{}',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_methods
CREATE POLICY "Users can view own payment methods" 
ON payment_methods 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create own payment methods" 
ON payment_methods 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own payment methods" 
ON payment_methods 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can manage all payment methods" 
ON payment_methods 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert sample crypto assets for real-time rates
INSERT INTO crypto_assets (symbol, name, price_usd, price_change_24h, market_cap, volume_24h) VALUES
('BTC', 'Bitcoin', 45000, 2.5, 850000000000, 25000000000),
('ETH', 'Ethereum', 3200, 1.8, 380000000000, 15000000000),
('USDT', 'Tether', 1.00, 0.1, 85000000000, 45000000000),
('BNB', 'Binance Coin', 320, 3.2, 50000000000, 2000000000),
('ADA', 'Cardano', 0.85, -1.2, 28000000000, 800000000),
('XRP', 'Ripple', 0.65, 0.8, 35000000000, 1200000000),
('SOL', 'Solana', 95, 4.5, 40000000000, 1800000000),
('DOT', 'Polkadot', 25, -0.5, 28000000000, 900000000);

-- Create triggers for updated_at columns
CREATE TRIGGER update_wallet_addresses_updated_at
BEFORE UPDATE ON wallet_addresses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON payment_methods
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add real-time publication for new tables
ALTER TABLE crypto_assets REPLICA IDENTITY FULL;
ALTER TABLE wallet_addresses REPLICA IDENTITY FULL;
ALTER TABLE payment_methods REPLICA IDENTITY FULL;