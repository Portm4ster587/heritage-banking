import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { HeritageLoadingScreen } from '@/components/HeritageLoadingScreen';
import { WithdrawForm } from '@/components/deposits/WithdrawForm';

export default function Withdraw() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([] as any[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Heritage Bank - Withdraw Funds';
    if (user) fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    try {
      const { data } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active');
      setAccounts(data || []);
    } catch (e) {
      console.error('Error fetching accounts:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <HeritageLoadingScreen message="Loading withdrawal options..." />;
  }

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Withdraw Funds</h1>
        <p className="text-muted-foreground">Send money from your Heritage accounts to external destinations</p>
      </div>
      <WithdrawForm accounts={accounts} onSuccess={fetchAccounts} />
    </main>
  );
}
