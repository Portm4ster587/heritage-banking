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
    if (transferAmount <= 0 || isNaN(transferAmount)) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Use the atomic RPC function for race-condition-safe transfers
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: result, error: rpcError } = await adminClient.rpc('process_crypto_transfer', {
      p_sender_id: user.id,
      p_sender_wallet_id: senderWalletId,
      p_recipient_wallet_address: recipientWalletAddress,
      p_amount: transferAmount,
      p_asset_symbol: assetSymbol
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

        if (recipientProfile?.phone) {
          fetch(`${supabaseUrl}/functions/v1/send-sms-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseServiceKey}` },
            body: JSON.stringify({
              to: recipientProfile.phone,
              message: `First Heritage Bank of America: You received ${transferAmount} ${assetSymbol} from ${senderName}. Check your crypto wallet.`,
              type: 'crypto'
            })
          }).catch(e => console.log('SMS to recipient failed:', e));
        }
      } catch (e) { console.log('Notification delivery failed:', e); }
    }

    console.log('Crypto transfer completed successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      message: result.message,
      newSenderBalance: result.newSenderBalance
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Crypto transfer error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred processing your request' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});