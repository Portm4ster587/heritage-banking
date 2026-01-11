import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CryptoWallet } from "@/components/CryptoWallet";
import { BTCInstantDeposit } from "@/components/deposits/BTCInstantDeposit";
import { BackButton } from "@/components/BackButton";
import { Wallet, Download } from "lucide-react";

export default function Crypto() {
  useEffect(() => {
    document.title = "Heritage Bank - Crypto";
  }, []);

  return (
    <main className="container mx-auto px-6 py-8">
      <BackButton to="/dashboard" label="Back to Dashboard" className="mb-4" />
      <h1 className="text-3xl font-bold text-primary mb-6">Heritage Crypto</h1>
      
      <Tabs defaultValue="wallet" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="deposit" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Instant Deposit
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="wallet">
          <CryptoWallet />
        </TabsContent>
        
        <TabsContent value="deposit">
          <BTCInstantDeposit />
        </TabsContent>
      </Tabs>
    </main>
  );
}
