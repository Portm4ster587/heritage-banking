import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InternalTransferForm } from "@/components/transfers/InternalTransferForm";
import { ExternalBankTransfer } from "@/components/ExternalBankTransfer";
import { HeritageLoadingScreen } from "@/components/HeritageLoadingScreen";

export default function Transfers() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Heritage Bank - Transfers";
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
    return <HeritageLoadingScreen message="Loading transfer options..." />;
  }

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Transfer Funds</h1>
        <p className="text-muted-foreground">Send money between Heritage Bank accounts or to external banks</p>
      </div>
      
      <Tabs defaultValue="internal" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="internal">Heritage Transfers</TabsTrigger>
          <TabsTrigger value="external">External Banks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="internal">
          <InternalTransferForm accounts={accounts} onSuccess={fetchAccounts} />
        </TabsContent>
        
        <TabsContent value="external">
          <ExternalBankTransfer />
        </TabsContent>
      </Tabs>
    </main>
  );
}
