-- Add ACFCU and more major USA banks to the directory
INSERT INTO usa_banks_directory (bank_name, bank_code, bank_type, routing_number, swift_code, is_active, supports_instant_verification)
VALUES 
  ('ACFCU (America''s Credit Union)', 'ACFCU', 'credit_union', '311985586', 'ACFCUS33', true, true),
  ('Charles Schwab Bank', 'SCHWAB', 'commercial', '121202211', 'SCHWUS33', true, false),
  ('Fidelity National Bank', 'FIDELITY', 'commercial', '071000013', NULL, true, false),
  ('Regions Bank', 'REGIONS', 'commercial', '062000019', 'REGUUS33', true, false),
  ('Fifth Third Bank', 'FIFTH3', 'commercial', '042000314', 'FTBCUS3C', true, false),
  ('KeyBank', 'KEYBANK', 'commercial', '041001039', 'KEYBUS33', true, false),
  ('Huntington Bank', 'HUNTINGTON', 'commercial', '044000024', 'HUNTUS33', true, false),
  ('M&T Bank', 'MTB', 'commercial', '022000046', 'MANTUS33', true, false),
  ('Citizens Bank', 'CITIZENS', 'commercial', '011500120', 'CTZIUS33', true, false),
  ('First Republic Bank', 'FRB', 'commercial', '321081669', NULL, true, false),
  ('Silicon Valley Bank', 'SVB', 'commercial', '121140399', 'SVBKUS6S', true, false),
  ('Zions Bank', 'ZIONS', 'commercial', '124000054', NULL, true, false),
  ('BMO Harris Bank', 'BMO', 'commercial', '071025661', 'BOFAUS3N', true, false),
  ('Comerica Bank', 'COMERICA', 'commercial', '072000096', 'MNBDUS33', true, false),
  ('TIAA Bank', 'TIAA', 'commercial', '063114111', NULL, true, false),
  ('State Employees Credit Union', 'SECU', 'credit_union', '253177049', NULL, true, true),
  ('Pentagon Federal Credit Union', 'PENFED', 'credit_union', '256078446', 'PFDCUS33', true, true),
  ('SchoolsFirst Federal Credit Union', 'SFCU', 'credit_union', '322277956', NULL, true, true),
  ('Boeing Employees Credit Union', 'BECU', 'credit_union', '325081403', NULL, true, true),
  ('First Tech Federal Credit Union', 'FTFCU', 'credit_union', '321180379', NULL, true, true),
  ('Digital Federal Credit Union', 'DCU', 'credit_union', '211391825', NULL, true, true),
  ('Alliant Credit Union', 'ALLIANT', 'credit_union', '271081528', NULL, true, true),
  ('Chime Bank', 'CHIME', 'online', '103100195', NULL, true, false),
  ('Varo Bank', 'VARO', 'online', '091311229', NULL, true, false),
  ('Current Bank', 'CURRENT', 'online', '021214891', NULL, true, false),
  ('SoFi Bank', 'SOFI', 'online', '065600108', NULL, true, false),
  ('Revolut Bank', 'REVOLUT', 'online', '084009519', NULL, true, false)
ON CONFLICT (bank_code) DO NOTHING;

-- Create loan_applications table for loan management
CREATE TABLE IF NOT EXISTS public.loan_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  loan_type TEXT NOT NULL CHECK (loan_type IN ('personal_loan', 'auto_loan', 'home_loan', 'business_loan', 'student_loan', 'credit_line')),
  requested_amount NUMERIC NOT NULL,
  approved_amount NUMERIC,
  interest_rate NUMERIC,
  loan_term_months INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'funded', 'active', 'closed', 'default')),
  purpose TEXT,
  employment_status TEXT,
  annual_income NUMERIC,
  credit_score INTEGER,
  collateral_description TEXT,
  collateral_value NUMERIC,
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  funded_at TIMESTAMP WITH TIME ZONE,
  first_payment_date DATE,
  monthly_payment NUMERIC,
  remaining_balance NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on loan_applications
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for loan_applications
CREATE POLICY "Users can view their own loan applications"
  ON public.loan_applications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own loan applications"
  ON public.loan_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all loan applications"
  ON public.loan_applications
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all loan applications"
  ON public.loan_applications
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_loan_applications_updated_at
  BEFORE UPDATE ON public.loan_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create id_verifications table for KYC/ID.me
CREATE TABLE IF NOT EXISTS public.id_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  verification_type TEXT NOT NULL DEFAULT 'id_me' CHECK (verification_type IN ('id_me', 'manual', 'document')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'verified', 'failed', 'expired')),
  verification_level TEXT DEFAULT 'basic' CHECK (verification_level IN ('basic', 'enhanced', 'full')),
  document_type TEXT,
  document_number_encrypted TEXT,
  document_expiry DATE,
  selfie_url TEXT,
  document_front_url TEXT,
  document_back_url TEXT,
  verification_score INTEGER,
  failure_reason TEXT,
  admin_notes TEXT,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on id_verifications
ALTER TABLE public.id_verifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for id_verifications
CREATE POLICY "Users can view their own verifications"
  ON public.id_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verifications"
  ON public.id_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verifications"
  ON public.id_verifications
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all verifications"
  ON public.id_verifications
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_id_verifications_updated_at
  BEFORE UPDATE ON public.id_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();