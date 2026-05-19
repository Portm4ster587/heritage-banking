import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DAILY_LIMIT = 5000;

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
    if (amt > DAILY_LIMIT) {
      return new Response(JSON.stringify({ error: `Zelle per-transaction limit is $${DAILY_LIMIT.toLocaleString()}` }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Enforce daily cumulative limit
    const { data: dailyTotal } = await admin.rpc('zelle_daily_sent_total', { p_user_id: user.id });
    const alreadySent = Number(dailyTotal || 0);
    if (alreadySent + amt > DAILY_LIMIT) {
      const remaining = Math.max(0, DAILY_LIMIT - alreadySent);
      return new Response(JSON.stringify({
        error: `Daily Zelle limit exceeded. You've sent $${alreadySent.toLocaleString()} today. Remaining: $${remaining.toLocaleString()}.`
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fast internal lookup via RPC
    const { data: lookup } = await admin.rpc('lookup_zelle_recipient', { p_identifier: String(recipientIdentifier).trim() });
    const internal = Array.isArray(lookup) ? lookup[0] : null;
    const recipientUserId: string | null = internal?.recipient_user_id || null;
    const recipientAccountNumber: string | null = internal?.recipient_account_number || null;
    const resolvedName: string | null = internal?.recipient_name || null;

    // Internal Zelle → instant via heritage RPC
    if (recipientUserId && recipientUserId !== user.id && recipientAccountNumber) {
      const { data: result, error: rpcError } = await admin.rpc('process_heritage_transfer', {
        p_sender_id: user.id,
        p_from_account_id: fromAccountId,
        p_recipient_account_number: recipientAccountNumber,
        p_amount: amt,
        p_memo: `Zelle: ${memo || 'Payment'}`
      });
      if (rpcError || (result as any)?.error) {
        return new Response(JSON.stringify({ error: (result as any)?.error || 'Transfer failed' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      // Reclassify the internal transfer record as zelle for unified history
      await admin
        .from('transfers')
        .update({ transfer_type: 'zelle', description: `Zelle to ${recipientName || resolvedName || recipientIdentifier}${memo ? ` — ${memo}` : ''}` })
        .eq('user_id', user.id)
        .eq('transfer_type', 'heritage_internal')
        .order('created_at', { ascending: false })
        .limit(1);
      return new Response(JSON.stringify({ success: true, status: 'completed', method: 'zelle_internal', recipientName: resolvedName, ...result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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
      description: `Zelle to ${recipientName || recipientIdentifier}${memo ? ` — ${memo}` : ''}`,
      user_id: user.id,
      transfer_type: 'zelle',
      status: 'pending',
      recipient_name: recipientName || recipientIdentifier,
      recipient_account: recipientIdentifier,
    });
    await admin.from('user_notifications').insert({
      user_id: user.id,
      title: 'Zelle Payment Sent',
      message: `Your $${amt.toLocaleString()} Zelle to ${recipientName || recipientIdentifier} is processing. Delivery within 1 business day.`,
      type: 'transfer',
      priority: 'normal',
    });

    return new Response(JSON.stringify({ success: true, status: 'pending', method: 'zelle_external' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('Zelle error:', e);
    return new Response(JSON.stringify({ error: 'An error occurred' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
