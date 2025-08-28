-- Create applications table for all banking applications
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  application_type TEXT NOT NULL CHECK (application_type IN ('checking', 'savings', 'business', 'credit_card', 'personal_loan', 'home_loan', 'auto_loan', 'business_loan')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'additional_info_required')),
  
  -- Personal Information
  first_name TEXT,
  last_name TEXT,
  middle_name TEXT,
  date_of_birth DATE,
  ssn_last4 TEXT,
  phone TEXT,
  email TEXT,
  
  -- Address Information
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  
  -- Employment Information
  employment_status TEXT,
  employer_name TEXT,
  job_title TEXT,
  work_phone TEXT,
  annual_income NUMERIC,
  employment_length INTEGER, -- in months
  
  -- Financial Information
  monthly_income NUMERIC,
  monthly_expenses NUMERIC,
  existing_debt NUMERIC,
  assets_value NUMERIC,
  
  -- Application Specific Data
  requested_amount NUMERIC,
  requested_limit NUMERIC,
  purpose TEXT,
  collateral_description TEXT,
  
  -- Business Information (for business applications)
  business_name TEXT,
  business_type TEXT,
  business_ein TEXT,
  business_address TEXT,
  business_phone TEXT,
  years_in_business INTEGER,
  annual_revenue NUMERIC,
  
  -- ID Verification
  id_verification_status TEXT DEFAULT 'pending' CHECK (id_verification_status IN ('pending', 'verified', 'failed')),
  id_verification_url TEXT,
  id_verification_data JSONB DEFAULT '{}',
  
  -- Additional documents and data
  documents JSONB DEFAULT '[]',
  additional_data JSONB DEFAULT '{}',
  
  -- Review information
  reviewed_by_admin_id UUID,
  review_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Applications: users can create their own"
ON public.applications
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Applications: users can view their own"
ON public.applications
FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Applications: admin can manage all"
ON public.applications
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update profiles table to include more fields for applications
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS middle_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employment_status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employer_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS annual_income NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_income NUMERIC;