import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bitcoin, Send, Wallet, TrendingUp, Download, Upload, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import cryptoBgImage from "@/assets/crypto-bg.jpg";

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

const cryptoAssets: CryptoAsset[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: 0.0234,
    usdValue: 1456.78,
    price: 62250.50,
    change24h: 2.34,
    icon: '₿'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: 0.823,
    usdValue: 2047.15,
    price: 2487.90,
    change24h: -1.23,
    icon: 'Ξ'
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    balance: 5000.00,
    usdValue: 5000.00,
    price: 1.00,
    change24h: 0.01,
    icon: '₮'
  },
  {
    symbol: 'LTC',
    name: 'Litecoin',
    balance: 12.45,
    usdValue: 1122.30,
    price: 90.15,
    change24h: 4.12,
    icon: 'Ł'
  }
];

const recentTransactions: Transaction[] = [
  {
    id: '1',
    type: 'receive',
    asset: 'BTC',
    amount: 0.001,
    usdValue: 62.25,
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
  },
  {
    id: '2',
    type: 'send',
    asset: 'ETH',
    amount: 0.1,
    usdValue: 248.79,
    timestamp: '2024-01-14T15:45:00Z',
    status: 'completed',
    address: '0x742d35Cc6634C0532925a3b8D38AA632022C'
  },
  {
    id: '3',
    type: 'buy',
    asset: 'USDT',
    amount: 1000,
    usdValue: 1000.00,
    timestamp: '2024-01-13T09:15:00Z',
    status: 'pending'
  }
];

export const CryptoWallet = () => {
  const [selectedAsset, setSelectedAsset] = useState<string>('BTC');
  const [sendAmount, setSendAmount] = useState<string>('');
  const [receiveAddress, setReceiveAddress] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

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
  };

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
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
    { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
    { symbol: 'USDT', name: 'Tether', icon: '₮' },
    { symbol: 'BNB', name: 'Binance Coin', icon: '💰' }
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {displayAssets.map((asset) => {
                  const balance = getWalletBalance(asset.symbol);
                  const usdValue = getWalletUsdValue(asset.symbol);
                  return (
                    <Card 
                      key={asset.symbol} 
                      className={`cursor-pointer transition-all hover:shadow-md ${selectedAsset === asset.symbol ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedAsset(asset.symbol)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{asset.icon}</span>
                            <div>
                              <p className="font-bold">{asset.symbol}</p>
                              <p className="text-xs text-muted-foreground">{asset.name}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Balance</p>
                          <p className="font-bold">{balance.toFixed(4)} {asset.symbol}</p>
                          <p className="text-sm text-secondary">${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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

      {/* Wallet Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-6 w-6 text-primary" />
              <span>Send Crypto</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Asset</Label>
              <div className="flex space-x-2">
                {cryptoAssets.map((asset) => (
                  <Button
                    key={asset.symbol}
                    variant={selectedAsset === asset.symbol ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAsset(asset.symbol)}
                  >
                    {asset.icon} {asset.symbol}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="send-amount">Amount</Label>
              <Input
                id="send-amount"
                type="number"
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                step="0.00000001"
              />
              <p className="text-xs text-muted-foreground">
                Available: {cryptoAssets.find(a => a.symbol === selectedAsset)?.balance} {selectedAsset}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receive-address">Recipient Address</Label>
              <Input
                id="receive-address"
                placeholder="Enter recipient wallet address"
                value={receiveAddress}
                onChange={(e) => setReceiveAddress(e.target.value)}
              />
            </div>

            <Button onClick={handleSendCrypto} className="w-full banking-button">
              <Send className="h-4 w-4 mr-2" />
              Send {selectedAsset}
            </Button>
          </CardContent>
        </Card>

        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-6 w-6 text-secondary" />
              <span>Receive Crypto</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Asset</Label>
              <div className="flex space-x-2">
                {cryptoAssets.map((asset) => (
                  <Button
                    key={asset.symbol}
                    variant={selectedAsset === asset.symbol ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAsset(asset.symbol)}
                  >
                    {asset.icon} {asset.symbol}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Your {selectedAsset} Address</Label>
              <div className="flex space-x-2">
                <Input 
                  value={walletAddress} 
                  readOnly 
                  className="bg-muted"
                />
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(walletAddress)}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="p-4 border-2 border-dashed border-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">QR Code</p>
              <div className="w-32 h-32 bg-muted mx-auto rounded-lg flex items-center justify-center">
                <span className="text-4xl">{cryptoAssets.find(a => a.symbol === selectedAsset)?.icon}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Scan to send {selectedAsset} to this wallet
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

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