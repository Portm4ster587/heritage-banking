import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InternalTransferForm } from "@/components/transfers/InternalTransferForm";
import { ExternalBankTransfer } from "@/components/ExternalBankTransfer";
import { WireTransferForm } from "@/components/transfers/WireTransferForm";
import { CrossBankTransferForm } from "@/components/transfers/CrossBankTransferForm";
import { ZelleTransferForm } from "@/components/transfers/ZelleTransferForm";
import { HeritageLoadingScreen } from "@/components/HeritageLoadingScreen";
import { BackButton } from "@/components/BackButton";
import { ArrowRightLeft, Building2, Globe, Network, Zap } from "lucide-react";

export default function Transfers() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "First Heritage Bank of America - Transfers";
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
      <BackButton to="/dashboard" label="Back to Dashboard" className="mb-4" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Transfer Funds</h1>
        <p className="text-muted-foreground">Send money between accounts, to external banks, or via wire transfer</p>
      </div>
      
      <Tabs defaultValue="internal" className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="internal" className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Heritage</span>
          </TabsTrigger>
          <TabsTrigger value="zelle" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Zelle</span>
          </TabsTrigger>
          <TabsTrigger value="external" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">ACH</span>
          </TabsTrigger>
          <TabsTrigger value="cross" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            <span className="hidden sm:inline">Cross-Bank</span>
          </TabsTrigger>
          <TabsTrigger value="wire" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Wire</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal">
          <InternalTransferForm accounts={accounts} onSuccess={fetchAccounts} />
        </TabsContent>

        <TabsContent value="zelle">
          <ZelleTransferForm accounts={accounts} onSuccess={fetchAccounts} />
        </TabsContent>

        <TabsContent value="external">
          <ExternalBankTransfer accounts={accounts} onSuccess={fetchAccounts} />
        </TabsContent>

        <TabsContent value="cross">
          <CrossBankTransferForm accounts={accounts} onSuccess={fetchAccounts} />
        </TabsContent>

        <TabsContent value="wire">
          <WireTransferForm accounts={accounts} onSuccess={fetchAccounts} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
