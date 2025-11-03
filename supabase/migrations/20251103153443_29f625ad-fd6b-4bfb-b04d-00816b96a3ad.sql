-- ============================================
-- PHASE 1: USER ROLES & SECURITY
-- ============================================

-- Create app_role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'manager');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- PHASE 2: COMPREHENSIVE ACCOUNT APPLICATIONS
-- ============================================

-- Account applications table with full KYC details
CREATE TABLE IF NOT EXISTS public.account_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Application Type
  application_type TEXT NOT NULL, -- checking, savings, business, credit_card, etc.
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, under_review
  
  -- Personal Information
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  ssn_encrypted TEXT NOT NULL, -- Store encrypted SSN
  ssn_last_4 TEXT NOT NULL,
  citizenship TEXT NOT NULL DEFAULT 'US',
  
  -- Contact Information
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  
  -- Address Information
  street_address TEXT NOT NULL,
  apt_unit TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'USA',
  years_at_address INTEGER,
  
  -- Previous Address (if less than 2 years at current)
  prev_street_address TEXT,
  prev_city TEXT,
  prev_state TEXT,
  prev_zip_code TEXT,
  
  -- Employment Information
  employment_status TEXT NOT NULL,
  employer_name TEXT,
  occupation TEXT,
  employer_phone TEXT,
  years_employed INTEGER,
  annual_income DECIMAL(12,2),
  other_income_source TEXT,
  other_income_amount DECIMAL(12,2),
  
  -- Security Questions & Answers (encrypted)
  security_question_1 TEXT NOT NULL,
  security_answer_1_encrypted TEXT NOT NULL,
  security_question_2 TEXT NOT NULL,
  security_answer_2_encrypted TEXT NOT NULL,
  security_question_3 TEXT,
  security_answer_3_encrypted TEXT,
  
  -- Product Specific Fields
  requested_amount DECIMAL(12,2), -- For loans/credit cards
  initial_deposit_amount DECIMAL(12,2), -- For deposit accounts
  funding_source TEXT, -- How they'll fund the account
  
  -- Consents & Disclosures
  consent_credit_check BOOLEAN DEFAULT FALSE,
  consent_terms BOOLEAN DEFAULT FALSE,
  consent_privacy BOOLEAN DEFAULT FALSE,
  consent_electronic_communications BOOLEAN DEFAULT FALSE,
  
  -- ID Verification
  id_type TEXT, -- drivers_license, passport, state_id
  id_number_encrypted TEXT,
  id_state TEXT,
  id_expiration_date DATE,
  id_document_url TEXT,
  
  -- Additional Documents
  proof_of_address_url TEXT,
  proof_of_income_url TEXT,
  
  -- Application Processing
  application_number TEXT UNIQUE NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  approval_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Generated Account Details (post-approval)
  generated_account_number TEXT,
  generated_routing_number TEXT DEFAULT '021000021', -- Heritage Bank routing
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.account_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for applications
DROP POLICY IF EXISTS "Users can view their own applications" ON public.account_applications;
CREATE POLICY "Users can view their own applications"
ON public.account_applications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own applications" ON public.account_applications;
CREATE POLICY "Users can create their own applications"
ON public.account_applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all applications" ON public.account_applications;
CREATE POLICY "Admins can view all applications"
ON public.account_applications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update all applications" ON public.account_applications;
CREATE POLICY "Admins can update all applications"
ON public.account_applications FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Function to generate unique application number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  number_exists BOOLEAN;
BEGIN
  LOOP
    new_number := 'APP' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    SELECT EXISTS(SELECT 1 FROM public.account_applications WHERE application_number = new_number)
    INTO number_exists;
    
    EXIT WHEN NOT number_exists;
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate application number
CREATE OR REPLACE FUNCTION set_application_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_number IS NULL THEN
    NEW.application_number := generate_application_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_application_number ON public.account_applications;
CREATE TRIGGER trigger_set_application_number
BEFORE INSERT ON public.account_applications
FOR EACH ROW
EXECUTE FUNCTION set_application_number();

-- ============================================
-- PHASE 3: EXTERNAL BANK ACCOUNTS LINKING
-- ============================================

-- USA Banks directory
CREATE TABLE IF NOT EXISTS public.usa_banks_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL,
  bank_code TEXT UNIQUE NOT NULL,
  routing_number TEXT,
  swift_code TEXT,
  bank_type TEXT NOT NULL, -- commercial, credit_union, online
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1e3a8a',
  secondary_color TEXT DEFAULT '#d4af37',
  is_active BOOLEAN DEFAULT TRUE,
  supports_instant_verification BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.usa_banks_directory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view banks directory" ON public.usa_banks_directory;
CREATE POLICY "Everyone can view banks directory"
ON public.usa_banks_directory FOR SELECT
TO authenticated
USING (is_active = TRUE);

-- Insert major USA banks
INSERT INTO public.usa_banks_directory (bank_name, bank_code, routing_number, bank_type, logo_url) VALUES
  ('Bank of America', 'BOA', '026009593', 'commercial', NULL),
  ('Chase Bank', 'CHASE', '021000021', 'commercial', NULL),
  ('Wells Fargo', 'WF', '121000248', 'commercial', NULL),
  ('Citibank', 'CITI', '021000089', 'commercial', NULL),
  ('U.S. Bank', 'USB', '091000022', 'commercial', NULL),
  ('PNC Bank', 'PNC', '043000096', 'commercial', NULL),
  ('Capital One', 'CAPONE', '065000090', 'commercial', NULL),
  ('TD Bank', 'TD', '011103093', 'commercial', NULL),
  ('Truist Bank', 'TRUIST', '061000104', 'commercial', NULL),
  ('Goldman Sachs Bank', 'GS', '124071889', 'commercial', NULL),
  ('Navy Federal Credit Union', 'NFCU', '256074974', 'credit_union', NULL),
  ('USAA Federal Savings Bank', 'USAA', '314074269', 'commercial', NULL),
  ('Ally Bank', 'ALLY', '124003116', 'online', NULL),
  ('Discover Bank', 'DISCOVER', '031100649', 'online', NULL),
  ('Marcus by Goldman Sachs', 'MARCUS', '124071889', 'online', NULL)
ON CONFLICT (bank_code) DO NOTHING;

-- Linked external accounts table
CREATE TABLE IF NOT EXISTS public.external_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Bank Information
  bank_id UUID REFERENCES public.usa_banks_directory(id),
  bank_name TEXT NOT NULL,
  bank_code TEXT,
  
  -- Account Information
  account_holder_name TEXT NOT NULL,
  account_type TEXT NOT NULL, -- checking, savings
  account_number_encrypted TEXT NOT NULL,
  account_number_last_4 TEXT NOT NULL,
  routing_number TEXT NOT NULL,
  
  -- Verification
  verification_status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, failed
  verification_method TEXT, -- micro_deposits, instant, manual
  verification_date TIMESTAMP WITH TIME ZONE,
  micro_deposit_amount_1 DECIMAL(5,2),
  micro_deposit_amount_2 DECIMAL(5,2),
  verification_attempts INTEGER DEFAULT 0,
  
  -- Account Status
  is_active BOOLEAN DEFAULT TRUE,
  is_primary BOOLEAN DEFAULT FALSE,
  nickname TEXT,
  
  -- Metadata
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_external_account UNIQUE(user_id, account_number_last_4, routing_number)
);

-- Enable RLS
ALTER TABLE public.external_bank_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own external accounts" ON public.external_bank_accounts;
CREATE POLICY "Users can view their own external accounts"
ON public.external_bank_accounts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own external accounts" ON public.external_bank_accounts;
CREATE POLICY "Users can create their own external accounts"
ON public.external_bank_accounts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own external accounts" ON public.external_bank_accounts;
CREATE POLICY "Users can update their own external accounts"
ON public.external_bank_accounts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own external accounts" ON public.external_bank_accounts;
CREATE POLICY "Users can delete their own external accounts"
ON public.external_bank_accounts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_account_applications_user_id ON public.account_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_account_applications_status ON public.account_applications(status);
CREATE INDEX IF NOT EXISTS idx_account_applications_app_number ON public.account_applications(application_number);
CREATE INDEX IF NOT EXISTS idx_external_accounts_user_id ON public.external_bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_external_accounts_status ON public.external_bank_accounts(verification_status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_account_applications_updated_at ON public.account_applications;
CREATE TRIGGER update_account_applications_updated_at
BEFORE UPDATE ON public.account_applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_external_accounts_updated_at ON public.external_bank_accounts;
CREATE TRIGGER update_external_accounts_updated_at
BEFORE UPDATE ON public.external_bank_accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();