import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accountNumber, routingNumber, bankCode } = await req.json();

    if (!accountNumber) {
      return new Response(
        JSON.stringify({ error: 'Account number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Looking up account: ${accountNumber.slice(-4)}, routing: ${routingNumber || 'N/A'}`);

    // First, check if this is a Heritage Bank internal account
    const { data: internalAccount, error: internalError } = await supabase
      .from('accounts')
      .select('id, account_number, account_type, user_id')
      .eq('account_number', accountNumber)
      .eq('status', 'active')
      .maybeSingle();

    if (internalAccount) {
      // Get the profile for the account owner
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', internalAccount.user_id)
        .maybeSingle();

      if (profile) {
        const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        const maskedName = maskAccountName(fullName);
        
        console.log(`Found Heritage account for: ${maskedName}`);
        
        return new Response(
          JSON.stringify({
            found: true,
            accountName: maskedName,
            bankName: 'Heritage Bank',
            accountType: formatAccountType(internalAccount.account_type),
            isInternal: true,
            verified: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check external bank accounts
    const { data: externalAccount } = await supabase
      .from('external_bank_accounts')
      .select('account_holder_name, bank_name, account_type, verification_status')
      .eq('account_number_last_4', accountNumber.slice(-4))
      .eq('is_active', true)
      .maybeSingle();

    if (externalAccount) {
      const maskedName = maskAccountName(externalAccount.account_holder_name);
      
      return new Response(
        JSON.stringify({
          found: true,
          accountName: maskedName,
          bankName: externalAccount.bank_name,
          accountType: externalAccount.account_type,
          isInternal: false,
          verified: externalAccount.verification_status === 'verified'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If routing number provided, look up the bank
    if (routingNumber) {
      const { data: bank } = await supabase
        .from('usa_banks_directory')
        .select('bank_name, bank_code')
        .eq('routing_number', routingNumber)
        .eq('is_active', true)
        .maybeSingle();

      if (bank) {
        return new Response(
          JSON.stringify({
            found: false,
            bankName: bank.bank_name,
            bankCode: bank.bank_code,
            message: 'Bank verified, but account holder name not available for external accounts'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        found: false,
        message: 'Account not found in Heritage Bank system. Please verify the account details.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error looking up account:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function maskAccountName(name: string): string {
  if (!name || name.length < 3) return name;
  const parts = name.split(' ');
  return parts.map(part => {
    if (part.length <= 2) return part;
    return part[0] + '*'.repeat(part.length - 2) + part[part.length - 1];
  }).join(' ');
}

function formatAccountType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
