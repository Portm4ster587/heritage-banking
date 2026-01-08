import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Premium investment account setup for Invest Group Overseas LTD
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, email } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if this is the special investment account email
    const isInvestAccount = email?.toLowerCase() === 'invest@igoae.com';

    // Create or update profile
    const profileData = isInvestAccount ? {
      user_id,
      first_name: 'Invest Group',
      last_name: 'Overseas LTD',
      phone: '+1-212-555-0100',
      address: '1 Investment Plaza, Suite 5000',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      employment_status: 'Business Owner',
      employer_name: 'Invest Group Overseas LTD',
      annual_income: 50000000,
      username: 'investgroup'
    } : {
      user_id,
      first_name: email?.split('@')[0] || 'User',
      last_name: '',
    };

    await supabase.from('profiles').upsert(profileData, { onConflict: 'user_id' });

    if (isInvestAccount) {
      // Create premium accounts for Invest Group Overseas LTD
      const accounts = [
        { 
          user_id, 
          account_number: 'INV-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          routing_number: '021000021',
          account_type: 'Heritage Investing',
          balance: 567098000,
          status: 'active'
        },
        { 
          user_id, 
          account_number: 'BUS-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          routing_number: '021000021',
          account_type: 'Heritage Business',
          balance: 700678000,
          status: 'active'
        },
        { 
          user_id, 
          account_number: 'CHK-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          routing_number: '021000021',
          account_type: 'Premium Checking',
          balance: 25000000,
          status: 'active'
        },
        { 
          user_id, 
          account_number: 'SAV-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          routing_number: '021000021',
          account_type: 'High Yield Savings',
          balance: 85000000,
          status: 'active'
        }
      ];

      const { data: createdAccounts } = await supabase
        .from('accounts')
        .insert(accounts)
        .select();

      if (createdAccounts && createdAccounts.length > 0) {
        // Create 5 premium credit cards
        const cards = [
          {
            user_id,
            account_id: createdAccounts[2].id, // Premium Checking
            card_number: '4532' + Math.floor(Math.random() * 1e12).toString().padStart(12, '0'),
            card_type: 'Platinum Business',
            card_network: 'VISA',
            expiry_date: '12/29',
            cvv: '789',
            last4: '4532',
            credit_limit: 500000,
            available_credit: 485000,
            status: 'active',
            activation_status: 'activated'
          },
          {
            user_id,
            account_id: createdAccounts[2].id,
            card_number: '5412' + Math.floor(Math.random() * 1e12).toString().padStart(12, '0'),
            card_type: 'World Elite',
            card_network: 'Mastercard',
            expiry_date: '06/28',
            cvv: '456',
            last4: '5412',
            credit_limit: 1000000,
            available_credit: 920000,
            status: 'active',
            activation_status: 'activated'
          },
          {
            user_id,
            account_id: createdAccounts[0].id, // Heritage Investing
            card_number: '3782' + Math.floor(Math.random() * 1e12).toString().padStart(12, '0'),
            card_type: 'Centurion',
            card_network: 'Amex',
            expiry_date: '09/27',
            cvv: '1234',
            last4: '3782',
            credit_limit: 2000000,
            available_credit: 1850000,
            status: 'active',
            activation_status: 'activated'
          },
          {
            user_id,
            account_id: createdAccounts[1].id, // Heritage Business
            card_number: '6011' + Math.floor(Math.random() * 1e12).toString().padStart(12, '0'),
            card_type: 'Business Rewards',
            card_network: 'Discover',
            expiry_date: '03/28',
            cvv: '567',
            last4: '6011',
            credit_limit: 750000,
            available_credit: 680000,
            status: 'active',
            activation_status: 'activated'
          },
          {
            user_id,
            account_id: createdAccounts[1].id,
            card_number: '4916' + Math.floor(Math.random() * 1e12).toString().padStart(12, '0'),
            card_type: 'Infinite Privilege',
            card_network: 'VISA',
            expiry_date: '11/29',
            cvv: '890',
            last4: '4916',
            credit_limit: 3000000,
            available_credit: 2750000,
            status: 'active',
            activation_status: 'activated'
          }
        ];

        await supabase.from('cards').insert(cards);

        // Create Crypto Wallets - Total $18M+ (BTC $12M+, rest distributed)
        const cryptoWallets = [
          { user_id, asset_symbol: 'BTC', balance: 280.5, wallet_address: 'bc1q' + Math.random().toString(36).substring(2, 34) },
          { user_id, asset_symbol: 'ETH', balance: 1250.75, wallet_address: '0x' + Math.random().toString(36).substring(2, 42) },
          { user_id, asset_symbol: 'USDT', balance: 1500000, wallet_address: 'T' + Math.random().toString(36).substring(2, 35) },
          { user_id, asset_symbol: 'USDC', balance: 800000, wallet_address: '0x' + Math.random().toString(36).substring(2, 42) },
          { user_id, asset_symbol: 'SOL', balance: 12500, wallet_address: Math.random().toString(36).substring(2, 46) },
          { user_id, asset_symbol: 'XRP', balance: 450000, wallet_address: 'r' + Math.random().toString(36).substring(2, 35) }
        ];

        await supabase.from('crypto_wallets').insert(cryptoWallets);

        // Create extensive transaction history from 2020 with 200+ entries
        const transferHistory = [];
        const startDate = new Date('2020-01-15');
        const endDate = new Date();
        
        const companies = [
          'Blackstone Real Estate', 'Brookfield Properties', 'CBRE Group', 
          'Prologis Inc', 'Simon Property Group', 'AvalonBay Communities',
          'Coincube Investment', 'Digital Currency Group', 'Grayscale Investments',
          'JPMorgan Private Bank', 'Goldman Sachs Asset Mgmt', 'Morgan Stanley Wealth',
          'Vanguard Institutional', 'BlackRock Inc', 'State Street Global',
          'Fidelity Investments', 'Charles Schwab', 'Northern Trust',
          'US Treasury', 'IRS Tax Payment', 'NY State Tax', 'Federal Reserve'
        ];

        const descriptions = [
          'Real Estate Investment Return', 'Property Dividend Payment', 
          'Coincube Crypto Returns', 'BTC Trading Profit', 'ETH Staking Rewards',
          'Quarterly Dividend', 'Capital Gains Distribution', 'Interest Income',
          'Wire Transfer - Investment', 'ACH Deposit', 'Tax Payment', 'Tax Refund',
          'Property Sale Proceeds', 'Rental Income', 'Portfolio Rebalance',
          'Fixed Income Distribution', 'Private Equity Return', 'Hedge Fund Distribution'
        ];

        for (let i = 0; i < 220; i++) {
          const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
          const isDebit = Math.random() > 0.65;
          const company = companies[Math.floor(Math.random() * companies.length)];
          const description = descriptions[Math.floor(Math.random() * descriptions.length)];
          
          // Generate amounts based on type
          let amount: number;
          if (description.includes('Tax')) {
            amount = Math.floor(Math.random() * 500000) + 50000;
          } else if (description.includes('Coincube') || description.includes('Crypto')) {
            amount = Math.floor(Math.random() * 1100000) + 370000; // $370K to $1.4M
          } else if (description.includes('Real Estate') || description.includes('Property')) {
            amount = Math.floor(Math.random() * 2000000) + 100000;
          } else {
            amount = Math.floor(Math.random() * 500000) + 10000;
          }

          transferHistory.push({
            user_id,
            from_account_id: isDebit ? createdAccounts[Math.floor(Math.random() * 2)].id : null,
            to_account_id: !isDebit ? createdAccounts[Math.floor(Math.random() * 2)].id : null,
            amount,
            transfer_type: isDebit ? 'outgoing' : 'incoming',
            status: 'completed',
            description: `${description} - ${company}`,
            recipient_name: isDebit ? company : null,
            created_at: randomDate.toISOString(),
            completed_at: randomDate.toISOString()
          });
        }

        await supabase.from('transfers').insert(transferHistory);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: isInvestAccount ? 'Premium investment account created' : 'Basic account created'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Setup error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
