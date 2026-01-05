import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedDepositForm } from "@/components/deposits/EnhancedDepositForm";
import { HeritageLoadingScreen } from "@/components/HeritageLoadingScreen";

export default function TopUp() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Heritage Bank - Deposit Funds";
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    try {
      const { data } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active');
      
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <HeritageLoadingScreen message="Loading deposit options..." />;
  }

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Deposit Funds</h1>
        <p className="text-muted-foreground">Add money to your Heritage Bank accounts via crypto, card, check, ACH, or wire transfer</p>
      </div>
      <EnhancedDepositForm accounts={accounts} onSuccess={fetchAccounts} />
    </main>
  );
}
