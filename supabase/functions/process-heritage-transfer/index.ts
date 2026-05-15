import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify calling user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { fromAccountId, recipientAccountNumber, amount, memo } = await req.json();

    if (!fromAccountId || !recipientAccountNumber || !amount) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0 || isNaN(transferAmount)) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Use the atomic RPC function for race-condition-safe transfers
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: result, error: rpcError } = await adminClient.rpc('process_heritage_transfer', {
      p_sender_id: user.id,
      p_from_account_id: fromAccountId,
      p_recipient_account_number: recipientAccountNumber,
      p_amount: transferAmount,
      p_memo: memo || null
    });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      return new Response(JSON.stringify({ error: 'An error occurred processing your request' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Send SMS/Email notifications asynchronously (non-critical)
    const recipientUserId = result.recipientUserId;
    if (recipientUserId) {
      try {
        const { data: recipientProfile } = await adminClient
          .from('profiles')
          .select('phone, first_name, last_name')
          .eq('user_id', recipientUserId)
          .single();

        const { data: senderProfile } = await adminClient
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .single();

        const senderName = senderProfile 
          ? `${senderProfile.first_name || ''} ${senderProfile.last_name || ''}`.trim() 
          : 'Heritage Member';

        // SMS
        if (recipientProfile?.phone) {
          fetch(`${supabaseUrl}/functions/v1/send-sms-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseServiceKey}` },
            body: JSON.stringify({
              to: recipientProfile.phone,
              message: `First Heritage Bank of America: You received $${transferAmount.toLocaleString()} from ${senderName}. Check your account.`,
              type: 'transfer'
            })
          }).catch(e => console.log('SMS failed:', e));
        }

        // Email
        try {
          const { data: recipientAuth } = await adminClient.auth.admin.getUserById(recipientUserId);
          if (recipientAuth?.user?.email) {
            fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseServiceKey}` },
              body: JSON.stringify({
                to: recipientAuth.user.email,
                subject: `You Received $${transferAmount.toLocaleString()} - First Heritage Bank of America`,
                type: 'transfer',
                data: { amount: transferAmount, recipientName: senderName, transactionId: result.transactionId, status: 'completed' }
              })
            }).catch(e => console.log('Email failed:', e));
          }
        } catch (e) { console.log('Email delivery failed:', e); }
      } catch (e) { console.log('Notification delivery failed:', e); }
    }

    console.log('Heritage transfer completed successfully');

    return new Response(JSON.stringify({
      success: true,
      transactionId: result.transactionId,
      recipientName: result.recipientName,
      newBalance: result.newBalance
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Heritage transfer error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred processing your request' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});