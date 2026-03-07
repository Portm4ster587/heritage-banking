import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bitcoin, Send, Wallet, TrendingUp, Download, Upload, RefreshCw, ArrowRightLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import cryptoBgImage from "@/assets/crypto-bg.jpg";
import { CryptoInternalTransfer } from "./crypto/CryptoInternalTransfer";
import { HeritageWalletAddress } from "./crypto/HeritageWalletAddress";

interface CryptoAsset {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  price: number;
  change24h: number;
  icon: string;
}

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'buy' | 'sell';
  asset: string;
  amount: number;
  usdValue: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  address?: string;
}

// Crypto icons/logos mapping
const cryptoLogos: Record<string, { icon: string; color: string; bgColor: string }> = {
  BTC: { icon: '₿', color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  ETH: { icon: 'Ξ', color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  USDT: { icon: '₮', color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  BNB: { icon: '💎', color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  USDC: { icon: '$', color: 'text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  SOL: { icon: '◎', color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  XRP: { icon: '✕', color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-900/30' },
};

const recentTransactions: Transaction[] = [];

export const CryptoWallet = () => {
  const [selectedAsset, setSelectedAsset] = useState<string>('BTC');
  const [sendAmount, setSendAmount] = useState<string>('');
  const [receiveAddress, setReceiveAddress] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>(recentTransactions);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWallets = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('crypto_wallets')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setWallets(data || []);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      toast({
        title: "Error",
        description: "Failed to load crypto wallets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Setup real-time subscription for crypto wallets
  useEffect(() => {
    if (!user) return;

    fetchWallets();

    // Real-time subscription for wallet updates
    const channel = supabase
      .channel('crypto-wallet-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'crypto_wallets', filter: `user_id=eq.${user.id}` },
        () => {
          fetchWallets();
          toast({
            title: "Wallet Updated",
            description: "Your crypto wallet balance has been updated",
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, fetchWallets, toast]);

  useEffect(() => {
    // Generate a mock wallet address for the selected asset
    const generateWalletAddress = (asset: string) => {
      const addresses = {
        BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        ETH: '0x742d35Cc6634C0532925a3b8D38AA632022C3d8C',
        USDT: '0x742d35Cc6634C0532925a3b8D38AA632022C3d8C',
        LTC: 'LTC1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
      };
      return addresses[asset as keyof typeof addresses] || '';
    };

    setWalletAddress(generateWalletAddress(selectedAsset));
  }, [selectedAsset]);

  const handleSendCrypto = () => {
    if (!sendAmount || !receiveAddress) {
      toast({
        title: "Missing Information",
        description: "Please enter amount and recipient address",
        variant: "destructive"
      });
      return;
    }

    const asset = cryptoAssets.find(a => a.symbol === selectedAsset);
    if (!asset || parseFloat(sendAmount) > asset.balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this transaction",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Transaction Initiated",
      description: `Sending ${sendAmount} ${selectedAsset} to ${receiveAddress.slice(0, 8)}...`,
    });

    // Reset form
    setSendAmount('');
    setReceiveAddress('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  // Get crypto prices (mock for now)
  const cryptoPrices = {
    BTC: 62250.50,
    ETH: 2487.90,
    USDT: 1.00,
    BNB: 320.45
  };

  const getWalletBalance = (symbol: string) => {
    const wallet = wallets.find(w => w.asset_symbol === symbol);
    return wallet?.balance || 0;
  };

  const getWalletUsdValue = (symbol: string) => {
    const balance = getWalletBalance(symbol);
    const price = cryptoPrices[symbol as keyof typeof cryptoPrices] || 0;
    return balance * price;
  };

  const totalPortfolioValue = ['BTC', 'ETH', 'USDT', 'BNB'].reduce(
    (sum, symbol) => sum + getWalletUsdValue(symbol), 
    0
  );

  const displayAssets = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'XRP', name: 'Ripple' },
    { symbol: 'BNB', name: 'Binance Coin' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative animate-slide-up">
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <img 
            src={cryptoBgImage} 
            alt="Crypto Background"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="relative z-10 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2">Heritage Crypto Wallet</h2>
            <p className="text-muted-foreground">Secure cryptocurrency storage and trading</p>
          </div>
          <Button onClick={fetchWallets} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <Card className="banking-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span>Portfolio Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading wallets...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-2">Total Portfolio Value</p>
                <p className="text-4xl font-bold text-primary">${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayAssets.map((asset) => {
                  const balance = getWalletBalance(asset.symbol);
                  const usdValue = getWalletUsdValue(asset.symbol);
                  const logo = cryptoLogos[asset.symbol] || { icon: '●', color: 'text-primary', bgColor: 'bg-muted' };
                  return (
                    <Card 
                      key={asset.symbol} 
                      className={`cursor-pointer transition-all hover:shadow-md ${selectedAsset === asset.symbol ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedAsset(asset.symbol)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-10 h-10 rounded-full ${logo.bgColor} flex items-center justify-center`}>
                            <span className={`text-xl font-bold ${logo.color}`}>{logo.icon}</span>
                          </div>
                          <div>
                            <p className="font-bold text-sm">{asset.symbol}</p>
                            <p className="text-[10px] text-muted-foreground">{asset.name}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-sm">{balance.toFixed(4)} {asset.symbol}</p>
                          <p className="text-xs text-muted-foreground">${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {!loading && wallets.length === 0 && (
        <Card className="bg-muted/50">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No crypto wallets found. Contact support to set up your wallet.</p>
          </CardContent>
        </Card>
      )}

      {/* Internal Crypto Transfers */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-bold">Send & Receive</h3>
          <Badge className="bg-primary/10 text-primary">Instant</Badge>
        </div>
      </div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send Crypto
          </TabsTrigger>
          <TabsTrigger value="receive" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Receive Crypto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <CryptoInternalTransfer wallets={wallets} onSuccess={fetchWallets} />
        </TabsContent>

        <TabsContent value="receive">
          <HeritageWalletAddress wallets={wallets} onWalletsUpdate={fetchWallets} />
        </TabsContent>
      </Tabs>

      {/* Transaction History */}
      <Card className="banking-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-accent" />
            <span>Transaction History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${tx.type === 'receive' ? 'bg-success/20' : tx.type === 'send' ? 'bg-destructive/20' : 'bg-primary/20'}`}>
                    {tx.type === 'receive' ? (
                      <Download className="h-4 w-4 text-success" />
                    ) : tx.type === 'send' ? (
                      <Upload className="h-4 w-4 text-destructive" />
                    ) : (
                      <Bitcoin className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{tx.type} {tx.asset}</p>
                    <p className="text-sm text-muted-foreground">
                      {tx.address ? `${tx.address.slice(0, 8)}...${tx.address.slice(-6)}` : 'Internal Transaction'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.asset}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${tx.usdValue.toLocaleString()}
                  </p>
                  <Badge variant={tx.status === 'completed' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'}>
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};