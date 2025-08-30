-- Create admin notifications table for deposit/withdraw requests
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('deposit_request', 'withdraw_request', 'application_update', 'transaction_alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID,
  reference_id UUID,
  read BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for admin notifications
CREATE POLICY "Admin can manage all notifications"
ON public.admin_notifications
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create deposit requests table
CREATE TABLE IF NOT EXISTS public.deposit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account_id UUID REFERENCES public.accounts(id),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency currency DEFAULT 'USD',
  method TEXT NOT NULL CHECK (method IN ('crypto', 'bank_transfer', 'card')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  transaction_hash TEXT,
  payment_details JSONB DEFAULT '{}',
  admin_notes TEXT,
  processed_by_admin_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for deposit requests
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for deposit requests
CREATE POLICY "Users can view own deposit requests"
ON public.deposit_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own deposit requests"
ON public.deposit_requests
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can manage all deposit requests"
ON public.deposit_requests
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create withdraw requests table  
CREATE TABLE IF NOT EXISTS public.withdraw_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account_id UUID REFERENCES public.accounts(id),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency currency DEFAULT 'USD',
  method TEXT NOT NULL CHECK (method IN ('crypto', 'bank_transfer', 'check')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  destination_details JSONB NOT NULL,
  admin_notes TEXT,
  processed_by_admin_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for withdraw requests
ALTER TABLE public.withdraw_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for withdraw requests
CREATE POLICY "Users can view own withdraw requests"
ON public.withdraw_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own withdraw requests"
ON public.withdraw_requests
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can manage all withdraw requests"
ON public.withdraw_requests
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create crypto wallets table
CREATE TABLE IF NOT EXISTS public.crypto_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  wallet_type TEXT NOT NULL CHECK (wallet_type IN ('BTC', 'ETH', 'USDT', 'LTC')),
  wallet_address TEXT NOT NULL,
  balance NUMERIC DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, wallet_type)
);

-- Enable RLS for crypto wallets
ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;

-- Create policies for crypto wallets
CREATE POLICY "Users can view own crypto wallets"
ON public.crypto_wallets
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own crypto wallets"
ON public.crypto_wallets  
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own crypto wallets"
ON public.crypto_wallets
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can manage all crypto wallets"
ON public.crypto_wallets
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE OR REPLACE TRIGGER update_admin_notifications_updated_at
    BEFORE UPDATE ON public.admin_notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_deposit_requests_updated_at
    BEFORE UPDATE ON public.deposit_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_withdraw_requests_updated_at
    BEFORE UPDATE ON public.withdraw_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_crypto_wallets_updated_at
    BEFORE UPDATE ON public.crypto_wallets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create admin notification
CREATE OR REPLACE FUNCTION create_admin_notification(
  notification_type TEXT,
  notification_title TEXT,
  notification_message TEXT,
  ref_user_id UUID DEFAULT NULL,
  reference_id UUID DEFAULT NULL,
  notification_priority TEXT DEFAULT 'normal'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, user_id, reference_id, priority)
  VALUES (notification_type, notification_title, notification_message, ref_user_id, reference_id, notification_priority)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;