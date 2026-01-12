import { useEffect, useState } from "react";
import { AccountStatements } from "@/components/AccountStatements";
import { RealTimeInvestmentHistory } from "@/components/RealTimeInvestmentHistory";
import { BackButton } from "@/components/BackButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, TrendingUp } from "lucide-react";

export default function History() {
  const [activeTab, setActiveTab] = useState('statements');

  useEffect(() => {
    document.title = "Heritage Bank - Transaction History";
  }, []);

  return (
    <main className="container mx-auto px-6 py-8">
      <BackButton to="/dashboard" label="Back to Dashboard" className="mb-4" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Transaction History</h1>
        <p className="text-muted-foreground">View your account statements and real-time transaction history</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="statements" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Investment Statements
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Real-Time History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="statements">
          <AccountStatements />
        </TabsContent>

        <TabsContent value="realtime">
          <RealTimeInvestmentHistory />
        </TabsContent>
      </Tabs>
    </main>
  );
}
