
-- TAC (Transaction Authorization Code) system
CREATE TABLE public.tac_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  wire_transfer_id uuid REFERENCES public.wire_transfers(id) ON DELETE CASCADE,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  requested_by uuid,
  generated_by uuid,
  delivery_method text DEFAULT 'both',
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '15 minutes'),
  verified_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.tac_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own TAC codes" ON public.tac_codes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all TAC codes" ON public.tac_codes
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create TAC codes" ON public.tac_codes
  FOR INSERT TO authenticated WITH CHECK (true);
