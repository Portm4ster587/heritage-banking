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

    const anon = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authErr } = await anon.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // verify admin
    const { data: roleRow } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: 'Admin only' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { transferId, action, reason } = await req.json();
    if (!transferId || !['approve', 'decline'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const fnName = action === 'approve' ? 'admin_approve_cross_bank_transfer' : 'admin_decline_cross_bank_transfer';
    const args: any = action === 'approve'
      ? { p_transfer_id: transferId, p_admin_id: user.id }
      : { p_transfer_id: transferId, p_admin_id: user.id, p_reason: reason || 'Declined by admin' };

    const { data: result, error: rpcErr } = await admin.rpc(fnName, args);
    if (rpcErr) {
      console.error('rpc error', rpcErr);
      return new Response(JSON.stringify({ error: rpcErr.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (result?.error) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fan out email + SMS to the sender
    try {
      const { data: t } = await admin
        .from('cross_bank_transfers')
        .select('user_id, amount, recipient_name, partner_bank, status')
        .eq('id', transferId)
        .maybeSingle();
      if (t) {
        const { data: senderUser } = await admin.auth.admin.getUserById(t.user_id);
        const { data: profile } = await admin
          .from('profiles')
          .select('phone, first_name')
          .eq('user_id', t.user_id)
          .maybeSingle();

        const approved = action === 'approve';
        const subject = approved
          ? `Cross-Bank Transfer Approved - $${Number(t.amount).toLocaleString()}`
          : `Cross-Bank Transfer Declined - $${Number(t.amount).toLocaleString()}`;
        const smsMsg = approved
          ? `Heritage Bank: Your $${Number(t.amount).toLocaleString()} transfer to ${t.recipient_name} has been approved and completed.`
          : `Heritage Bank: Your $${Number(t.amount).toLocaleString()} transfer to ${t.recipient_name} was declined. ${reason || ''}`.trim();

        if (senderUser?.user?.email) {
          fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}` },
            body: JSON.stringify({
              to: senderUser.user.email, subject, type: 'transfer',
              data: { amount: t.amount, recipientName: t.recipient_name, transactionId: transferId, status: approved ? 'completed' : 'declined', reason }
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
      }
    } catch (e) { console.log('notify err', e); }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('admin decision error', e);
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
