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

    // Verify the calling user
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

    const { senderWalletId, recipientWalletAddress, amount, assetSymbol } = await req.json();

    if (!senderWalletId || !recipientWalletAddress || !amount || !assetSymbol) {
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

    // Use service role to bypass RLS
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify sender owns the wallet
    const { data: senderWallet, error: senderError } = await adminClient
      .from('crypto_wallets')
      .select('id, user_id, balance, asset_symbol')
      .eq('id', senderWalletId)
      .eq('user_id', user.id)
      .single();

    if (senderError || !senderWallet) {
      console.error('Sender wallet not found:', senderError);
      return new Response(JSON.stringify({ error: 'Sender wallet not found or unauthorized' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if ((senderWallet.balance ?? 0) < transferAmount) {
      return new Response(JSON.stringify({ error: 'Insufficient balance' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Find recipient wallet
    const { data: recipientWallet, error: recipientError } = await adminClient
      .from('crypto_wallets')
      .select('id, user_id, balance, asset_symbol')
      .eq('wallet_address', recipientWalletAddress)
      .single();

    if (recipientError || !recipientWallet) {
      console.error('Recipient wallet not found:', recipientError);
      return new Response(JSON.stringify({ error: 'Recipient wallet not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prevent self-transfer
    if (recipientWallet.user_id === user.id) {
      return new Response(JSON.stringify({ error: 'Cannot transfer to yourself' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing crypto transfer: ${transferAmount} ${assetSymbol} from ${user.id} to ${recipientWallet.user_id}`);

    // Debit sender
    const { error: debitError } = await adminClient
      .from('crypto_wallets')
      .update({ balance: (senderWallet.balance ?? 0) - transferAmount })
      .eq('id', senderWallet.id);

    if (debitError) {
      console.error('Debit error:', debitError);
      throw new Error('Failed to debit sender');
    }

    // Credit recipient
    const { error: creditError } = await adminClient
      .from('crypto_wallets')
      .update({ balance: (recipientWallet.balance ?? 0) + transferAmount })
      .eq('id', recipientWallet.id);

    if (creditError) {
      console.error('Credit error:', creditError);
      // Rollback sender debit
      await adminClient.from('crypto_wallets')
        .update({ balance: senderWallet.balance })
        .eq('id', senderWallet.id);
      throw new Error('Failed to credit recipient');
    }

    // Get sender profile for notification
    const { data: senderProfile } = await adminClient
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();

    const senderName = senderProfile 
      ? `${senderProfile.first_name || ''} ${senderProfile.last_name || ''}`.trim() 
      : 'Heritage Member';

    // Notify recipient
    await adminClient.from('user_notifications').insert({
      user_id: recipientWallet.user_id,
      title: `${assetSymbol} Received`,
      message: `You received ${transferAmount} ${assetSymbol} from ${senderName} via Heritage Ecosystem`,
      type: 'crypto',
      priority: 'high'
    });

    // Notify sender
    await adminClient.from('user_notifications').insert({
      user_id: user.id,
      title: `${assetSymbol} Sent`,
      message: `You sent ${transferAmount} ${assetSymbol} via Heritage Ecosystem`,
      type: 'crypto',
      priority: 'normal'
    });

    // Send SMS/Email to recipient
    const { data: recipientProfile } = await adminClient
      .from('profiles')
      .select('phone')
      .eq('user_id', recipientWallet.user_id)
      .single();

    if (recipientProfile?.phone) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-sms-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseServiceKey}` },
          body: JSON.stringify({
            to: recipientProfile.phone,
            message: `Heritage Bank: You received ${transferAmount} ${assetSymbol} from ${senderName}. Check your crypto wallet.`,
            type: 'crypto'
          })
        });
      } catch (e) { console.log('SMS to recipient failed:', e); }
    }

    console.log('Crypto transfer completed successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully transferred ${transferAmount} ${assetSymbol}`,
      newSenderBalance: (senderWallet.balance ?? 0) - transferAmount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Crypto transfer error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Transfer failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
