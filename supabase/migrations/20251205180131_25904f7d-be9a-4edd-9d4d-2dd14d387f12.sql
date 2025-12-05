-- Create bill_payments table for bill payment system
CREATE TABLE public.bill_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  payee_name TEXT NOT NULL,
  payee_account TEXT NOT NULL,
  payee_type TEXT NOT NULL DEFAULT 'utility',
  amount NUMERIC NOT NULL,
  frequency TEXT DEFAULT 'one_time',
  next_payment_date DATE,
  last_payment_date DATE,
  status TEXT DEFAULT 'active',
  auto_pay BOOLEAN DEFAULT false,
  reminder_days INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_notifications table for persistent notifications
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal',
  related_type TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notification_settings table for user preferences
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  low_balance_alert BOOLEAN DEFAULT true,
  low_balance_threshold NUMERIC DEFAULT 100,
  large_transaction_alert BOOLEAN DEFAULT true,
  large_transaction_amount NUMERIC DEFAULT 500,
  security_alerts BOOLEAN DEFAULT true,
  payment_reminders BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for bill_payments
CREATE POLICY "Users can view own bill payments" ON public.bill_payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bill payments" ON public.bill_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bill payments" ON public.bill_payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bill payments" ON public.bill_payments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for user_notifications
CREATE POLICY "Users can view own notifications" ON public.user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.user_notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Allow system to insert notifications
CREATE POLICY "System can create notifications" ON public.user_notifications
  FOR INSERT WITH CHECK (true);

-- RLS policies for notification_settings
CREATE POLICY "Users can manage own notification settings" ON public.notification_settings
  FOR ALL USING (auth.uid() = user_id);

-- Enable realtime for accounts table for balance updates
ALTER TABLE public.accounts REPLICA IDENTITY FULL;

-- Add spending_limit column to cards table
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS spending_limit NUMERIC DEFAULT 5000;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_bill_payment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for bill_payments
CREATE TRIGGER update_bill_payments_updated_at
  BEFORE UPDATE ON public.bill_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bill_payment_timestamp();