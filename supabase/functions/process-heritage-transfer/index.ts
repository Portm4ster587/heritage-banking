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
    if (transferAmount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify sender owns the account
    const { data: senderAccount, error: senderError } = await adminClient
      .from('accounts')
      .select('id, user_id, balance, account_number, account_type')
      .eq('id', fromAccountId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (senderError || !senderAccount) {
      return new Response(JSON.stringify({ error: 'Source account not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if ((senderAccount.balance ?? 0) < transferAmount) {
      return new Response(JSON.stringify({ error: 'Insufficient funds' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Find recipient account
    const { data: recipientAccount, error: recipientError } = await adminClient
      .from('accounts')
      .select('id, user_id, balance, account_number, account_type')
      .eq('account_number', recipientAccountNumber)
      .eq('status', 'active')
      .single();

    if (recipientError || !recipientAccount) {
      return new Response(JSON.stringify({ error: 'Recipient account not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (recipientAccount.user_id === user.id) {
      return new Response(JSON.stringify({ error: 'Cannot transfer to your own account via Heritage transfer' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing heritage transfer: $${transferAmount} from ${user.id} to ${recipientAccount.user_id}`);

    // Get sender and recipient profiles
    const { data: senderProfile } = await adminClient
      .from('profiles')
      .select('first_name, last_name, phone')
      .eq('user_id', user.id)
      .single();

    const { data: recipientProfile } = await adminClient
      .from('profiles')
      .select('first_name, last_name, phone')
      .eq('user_id', recipientAccount.user_id)
      .single();

    const senderName = senderProfile ? `${senderProfile.first_name || ''} ${senderProfile.last_name || ''}`.trim() : 'Heritage Member';
    const recipientName = recipientProfile ? `${recipientProfile.first_name || ''} ${recipientProfile.last_name || ''}`.trim() : 'Heritage Member';

    const transactionId = `HBT${Date.now().toString(36).toUpperCase()}`;

    // Debit sender
    const { error: debitError } = await adminClient
      .from('accounts')
      .update({ balance: (senderAccount.balance ?? 0) - transferAmount })
      .eq('id', senderAccount.id);

    if (debitError) {
      console.error('Debit error:', debitError);
      throw new Error('Failed to debit sender');
    }

    // Credit recipient
    const { error: creditError } = await adminClient
      .from('accounts')
      .update({ balance: (recipientAccount.balance ?? 0) + transferAmount })
      .eq('id', recipientAccount.id);

    if (creditError) {
      // Rollback
      await adminClient.from('accounts')
        .update({ balance: senderAccount.balance })
        .eq('id', senderAccount.id);
      throw new Error('Failed to credit recipient');
    }

    // Create transfer record for sender
    await adminClient.from('transfers').insert({
      from_account_id: senderAccount.id,
      to_account_id: recipientAccount.id,
      amount: transferAmount,
      description: memo || `Heritage Transfer to ${recipientName}`,
      user_id: user.id,
      transfer_type: 'heritage_internal',
      status: 'completed',
      recipient_name: recipientName,
      recipient_account: recipientAccountNumber,
      completed_at: new Date().toISOString()
    });

    // Notify recipient
    await adminClient.from('user_notifications').insert({
      user_id: recipientAccount.user_id,
      title: 'Money Received',
      message: `You received $${transferAmount.toLocaleString()} from ${senderName}`,
      type: 'transfer',
      priority: 'high'
    });

    // Notify sender
    await adminClient.from('user_notifications').insert({
      user_id: user.id,
      title: 'Transfer Sent',
      message: `You sent $${transferAmount.toLocaleString()} to ${recipientName}`,
      type: 'transfer',
      priority: 'normal'
    });

    // Send SMS to recipient
    if (recipientProfile?.phone) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-sms-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseServiceKey}` },
          body: JSON.stringify({
            to: recipientProfile.phone,
            message: `Heritage Bank: You received $${transferAmount.toLocaleString()} from ${senderName}. Check your account.`,
            type: 'transfer'
          })
        });
      } catch (e) { console.log('SMS failed:', e); }
    }

    // Send email to recipient
    try {
      const { data: recipientAuth } = await adminClient.auth.admin.getUserById(recipientAccount.user_id);
      if (recipientAuth?.user?.email) {
        await fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseServiceKey}` },
          body: JSON.stringify({
            to: recipientAuth.user.email,
            subject: `You Received $${transferAmount.toLocaleString()} - Heritage Bank`,
            type: 'transfer',
            data: { amount: transferAmount, recipientName: senderName, transactionId, status: 'completed' }
          })
        });
      }
    } catch (e) { console.log('Email failed:', e); }

    console.log('Heritage transfer completed successfully');

    return new Response(JSON.stringify({
      success: true,
      transactionId,
      recipientName,
      newBalance: (senderAccount.balance ?? 0) - transferAmount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Heritage transfer error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Transfer failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
