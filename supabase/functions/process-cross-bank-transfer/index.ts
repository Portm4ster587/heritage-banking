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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { fromAccountId, recipientAccountNumber, recipientName, amount, partnerBank, memo } = await req.json();
    const amt = parseFloat(amount);

    if (!fromAccountId || !recipientAccountNumber || !recipientName || !amt || amt <= 0) {
      return new Response(JSON.stringify({ error: 'Missing or invalid fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (!/^\d{10}$/.test(recipientAccountNumber)) {
      return new Response(JSON.stringify({ error: 'Recipient account must be 10 digits' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: result, error: rpcErr } = await admin.rpc('process_cross_bank_transfer', {
      p_sender_id: user.id,
      p_from_account_id: fromAccountId,
      p_recipient_account_number: recipientAccountNumber,
      p_recipient_name: recipientName,
      p_amount: amt,
      p_partner_bank: partnerBank || 'acfcu',
      p_memo: memo || null,
    });

    if (rpcErr) {
      console.error('RPC error:', rpcErr);
      return new Response(JSON.stringify({ error: 'Transfer failed' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (result?.error) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fan out email + SMS asynchronously (best-effort)
    try {
      const { data: profile } = await admin
        .from('profiles')
        .select('phone, first_name, last_name')
        .eq('user_id', user.id)
        .maybeSingle();

      const isPending = result.status === 'pending';
      const subject = isPending
        ? `Cross-Bank Transfer Pending Review - $${amt.toLocaleString()}`
        : `Cross-Bank Transfer Sent - $${amt.toLocaleString()}`;
      const smsMsg = isPending
        ? `First Heritage Bank of America: Your $${amt.toLocaleString()} transfer to ${recipientName} is pending admin review (transfers $50K+ require approval).`
        : `First Heritage Bank of America: You sent $${amt.toLocaleString()} to ${recipientName} at ${(partnerBank||'acfcu').toUpperCase()}. Ref: ${result.transferId.slice(0,8)}`;

      if (user.email) {
        fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}` },
          body: JSON.stringify({
            to: user.email, subject, type: 'transfer',
            data: { amount: amt, recipientName, transactionId: result.transferId, status: result.status }
          })
        }).catch(e => console.log('email err', e));
      }
      if (profile?.phone) {
        fetch(`${supabaseUrl}/functions/v1/send-sms-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}` },
          body: JSON.stringify({ to: profile.phone, message: smsMsg, type: 'transfer' })
        }).catch(e => console.log('sms err', e));
      }
    } catch (e) { console.log('notify err', e); }

    return new Response(JSON.stringify({
      success: true,
      transferId: result.transferId,
      status: result.status,
      requiresDualApproval: result.requiresDualApproval,
      newBalance: result.newBalance,
      heldAmount: result.heldAmount,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('Cross-bank transfer error:', e);
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
