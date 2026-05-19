import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const anonClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await anonClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { identifier } = await req.json();
    if (!identifier || typeof identifier !== 'string' || identifier.trim().length < 3) {
      return new Response(JSON.stringify({ internal: false }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const admin = createClient(url, serviceKey);
    const { data: dailyTotal } = await admin.rpc('zelle_daily_sent_total', { p_user_id: user.id });
    const { data: lookup } = await admin.rpc('lookup_zelle_recipient', { p_identifier: identifier.trim() });
    const row = Array.isArray(lookup) ? lookup[0] : null;
    const internal = !!(row && row.recipient_user_id && row.recipient_user_id !== user.id);

    return new Response(JSON.stringify({
      internal,
      recipientName: internal ? row.recipient_name : null,
      dailySent: Number(dailyTotal || 0),
      dailyRemaining: Math.max(0, 5000 - Number(dailyTotal || 0)),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('lookup-zelle-recipient error', e);
    return new Response(JSON.stringify({ error: 'lookup failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
