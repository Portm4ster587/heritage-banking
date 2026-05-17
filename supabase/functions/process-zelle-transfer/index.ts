import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const anonClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { fromAccountId, recipientIdentifier, recipientName, amount, memo } = await req.json();
    const amt = parseFloat(amount);
    if (!fromAccountId || !recipientIdentifier || !amt || amt <= 0) {
      return new Response(JSON.stringify({ error: 'Missing or invalid fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (amt > 5000) {
      return new Response(JSON.stringify({ error: 'Zelle daily limit is $5,000' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const identifier = String(recipientIdentifier).trim();
    const isEmail = identifier.includes('@');
    const phoneDigits = identifier.replace(/\D/g, '');

    // Try to find an internal Heritage recipient
    let recipientUserId: string | null = null;
    if (isEmail) {
      const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const match = users?.users?.find((u: any) => (u.email || '').toLowerCase() === identifier.toLowerCase());
      if (match) recipientUserId = match.id;
    } else if (phoneDigits.length >= 7) {
      const { data: profile } = await admin
        .from('profiles')
        .select('user_id, phone')
        .ilike('phone', `%${phoneDigits.slice(-10)}%`)
        .limit(1)
        .maybeSingle();
      if (profile) recipientUserId = profile.user_id;
    }

    // Internal Zelle → instant via heritage RPC
    if (recipientUserId && recipientUserId !== user.id) {
      const { data: recAccount } = await admin
        .from('accounts')
        .select('account_number')
        .eq('user_id', recipientUserId)
        .eq('status', 'active')
        .order('balance', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recAccount?.account_number) {
        const { data: result, error: rpcError } = await admin.rpc('process_heritage_transfer', {
          p_sender_id: user.id,
          p_from_account_id: fromAccountId,
          p_recipient_account_number: recAccount.account_number,
          p_amount: amt,
          p_memo: `Zelle: ${memo || 'Payment'}`
        });
        if (rpcError || result?.error) {
          return new Response(JSON.stringify({ error: result?.error || 'Transfer failed' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ success: true, status: 'completed', method: 'zelle_internal', ...result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // External Zelle → debit and record pending (1 business day)
    const { data: src, error: srcErr } = await admin
      .from('accounts')
      .select('id, balance, status')
      .eq('id', fromAccountId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (srcErr || !src) {
      return new Response(JSON.stringify({ error: 'Source account not found' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (src.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Source account is not active' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if ((src.balance ?? 0) < amt) {
      return new Response(JSON.stringify({ error: 'Insufficient funds' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    await admin.from('accounts').update({ balance: src.balance - amt }).eq('id', src.id);
    await admin.from('transfers').insert({
      from_account_id: src.id,
      to_account_id: null,
      amount: amt,
      description: `Zelle to ${recipientName || identifier}${memo ? ` — ${memo}` : ''}`,
      user_id: user.id,
      transfer_type: 'zelle',
      status: 'pending',
      recipient_name: recipientName || identifier,
      recipient_account: identifier,
    });
    await admin.from('user_notifications').insert({
      user_id: user.id,
      title: 'Zelle Payment Sent',
      message: `Your $${amt.toLocaleString()} Zelle to ${recipientName || identifier} is processing. Delivery within 1 business day.`,
      type: 'transfer',
      priority: 'normal',
    });

    return new Response(JSON.stringify({ success: true, status: 'pending', method: 'zelle_external' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('Zelle error:', e);
    return new Response(JSON.stringify({ error: 'An error occurred' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
