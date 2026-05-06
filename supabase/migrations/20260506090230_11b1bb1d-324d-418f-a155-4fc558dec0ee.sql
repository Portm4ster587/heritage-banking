CREATE TABLE IF NOT EXISTS public.cross_bank_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  direction text NOT NULL CHECK (direction IN ('outgoing','incoming')),
  partner_bank text NOT NULL DEFAULT 'acfcu',
  from_account_id uuid,
  from_account_number text,
  recipient_account_number text NOT NULL,
  recipient_name text,
  amount numeric NOT NULL CHECK (amount > 0),
  memo text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','completed','declined','failed')),
  external_reference text UNIQUE,
  approved_by uuid,
  approved_at timestamptz,
  completed_at timestamptz,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cbt_user ON public.cross_bank_transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_cbt_status ON public.cross_bank_transfers(status);
CREATE INDEX IF NOT EXISTS idx_cbt_external_ref ON public.cross_bank_transfers(external_reference);

ALTER TABLE public.cross_bank_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own cross-bank transfers"
ON public.cross_bank_transfers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users create own outgoing cross-bank transfers"
ON public.cross_bank_transfers FOR INSERT
WITH CHECK (auth.uid() = user_id AND direction = 'outgoing');

CREATE POLICY "Admins manage all cross-bank transfers"
ON public.cross_bank_transfers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_cbt_updated_at
BEFORE UPDATE ON public.cross_bank_transfers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.cross_bank_transfers;