import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowRightLeft, 
  TrendingUp, 
  Wallet,
  Bitcoin,
  DollarSign,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number | null;
  market_cap: number | null;
  updated_at: string | null;
}

interface CryptoWallet {
  id: string;
  asset_symbol: string;
  balance: number | null;
  wallet_address: string | null;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export const CryptoExchange = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([]);
  const [userWallets, setUserWallets] = useState<CryptoWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [exchanging, setExchanging] = useState(false);
  
  const [fromAsset, setFromAsset] = useState('');
  const [toAsset, setToAsset] = useState('');
  const [amount, setAmount] = useState('');
  const [estimatedReceive, setEstimatedReceive] = useState(0);

  useEffect(() => {
    if (user) {
      fetchCryptoData();
      fetchUserWallets();
    }
  }, [user]);

  useEffect(() => {
    if (fromAsset && toAsset && amount) {
      calculateExchange();
    }
  }, [fromAsset, toAsset, amount, cryptoAssets]);

  const fetchCryptoData = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_assets')
        .select('*')
        .eq('is_active', true)
        .order('market_cap', { ascending: false });

      if (error) throw error;
      setCryptoAssets(data || []);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
    }
  };

  const fetchUserWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_wallets')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active');

      if (error) throw error;
      setUserWallets(data || []);
    } catch (error) {
      console.error('Error fetching user wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateExchange = () => {
    const fromPrice = cryptoAssets.find(a => a.symbol === fromAsset)?.price_usd || 0;
    const toPrice = cryptoAssets.find(a => a.symbol === toAsset)?.price_usd || 0;
    
    if (fromPrice && toPrice && amount) {
      const fromValue = parseFloat(amount) * fromPrice;
      const toAmount = fromValue / toPrice;
      const fee = toAmount * 0.005; // 0.5% exchange fee
      setEstimatedReceive(toAmount - fee);
    }
  };

  const handleExchange = async () => {
    if (!fromAsset || !toAsset || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all exchange details",
        variant: "destructive"
      });
      return;
    }

    const fromWallet = userWallets.find(w => w.wallet_type === fromAsset);
    if (!fromWallet || fromWallet.balance < parseFloat(amount)) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${fromAsset} balance`,
        variant: "destructive"
      });
      return;
    }

    setExchanging(true);

    try {
      // Update FROM wallet balance
      await supabase
        .from('crypto_wallets')
        .update({ 
          balance: fromWallet.balance - parseFloat(amount)
        })
        .eq('id', fromWallet.id);

      // Find or create TO wallet
      let toWallet = userWallets.find(w => w.wallet_type === toAsset);
      if (!toWallet) {
        const { data: newWallet } = await supabase
          .from('crypto_wallets')
          .insert({
            user_id: user?.id,
            wallet_type: toAsset,
            wallet_address: `${toAsset}${Math.random().toString().slice(2, 12)}`,
            balance: estimatedReceive,
            is_primary: false
          })
          .select()
          .single();
        
        toWallet = newWallet;
      } else {
        // Update TO wallet balance
        await supabase
          .from('crypto_wallets')
          .update({ 
            balance: toWallet.balance + estimatedReceive
          })
          .eq('id', toWallet.id);
      }

      toast({
        title: "Exchange Successful!",
        description: `Exchanged ${amount} ${fromAsset} for ${estimatedReceive.toFixed(6)} ${toAsset}`,
      });

      // Reset form
      setFromAsset('');
      setToAsset('');
      setAmount('');
      setEstimatedReceive(0);
      
      // Refresh data
      fetchUserWallets();
      
    } catch (error) {
      console.error('Exchange error:', error);
      toast({
        title: "Exchange Failed",
        description: "Failed to process exchange. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExchanging(false);
    }
  };

  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const getCryptoIcon = (symbol: string) => {
    const iconMap: { [key: string]: string } = {
      'BTC': '₿',
      'ETH': 'Ξ',
      'USDT': '₮',
      'BNB': '⚡',
      'ADA': '♠',
      'XRP': '◊',
      'SOL': '◉',
      'DOT': '●',
    };
    return iconMap[symbol] || '◯';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading Heritage Crypto Exchange...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-primary mb-2">Heritage Crypto Exchange</h2>
        <p className="text-muted-foreground">Exchange crypto assets within the Heritage ecosystem</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exchange Interface */}
        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" />
              Crypto Exchange
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* From Asset */}
            <div className="space-y-3">
              <Label>From</Label>
              <div className="grid grid-cols-2 gap-3">
                <Select value={fromAsset} onValueChange={setFromAsset}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {userWallets.map((wallet) => (
                      <SelectItem key={wallet.wallet_type} value={wallet.wallet_type}>
                        <div className="flex items-center gap-2">
                          <span>{getCryptoIcon(wallet.wallet_type)}</span>
                          <span>{wallet.wallet_type}</span>
                          <Badge variant="outline" className="ml-auto">
                            {wallet.balance.toFixed(6)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.000001"
                />
              </div>
              {fromAsset && (
                <p className="text-sm text-muted-foreground">
                  Available: {userWallets.find(w => w.wallet_type === fromAsset)?.balance.toFixed(6)} {fromAsset}
                </p>
              )}
            </div>

            {/* Exchange Arrow */}
            <div className="flex justify-center">
              <div className="p-2 rounded-full bg-primary/10">
                <ArrowRightLeft className="w-5 h-5 text-primary" />
              </div>
            </div>

            {/* To Asset */}
            <div className="space-y-3">
              <Label>To</Label>
              <Select value={toAsset} onValueChange={setToAsset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  {cryptoAssets.map((asset) => (
                    <SelectItem key={asset.symbol} value={asset.symbol}>
                      <div className="flex items-center gap-2">
                        <span>{getCryptoIcon(asset.symbol)}</span>
                        <span>{asset.symbol}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatPrice(asset.price_usd)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {estimatedReceive > 0 && (
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-sm text-success font-medium">
                    You will receive: {estimatedReceive.toFixed(6)} {toAsset}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Includes 0.5% exchange fee
                  </p>
                </div>
              )}
            </div>

            {/* Exchange Button */}
            <Button 
              onClick={handleExchange}
              disabled={exchanging || !fromAsset || !toAsset || !amount || estimatedReceive <= 0}
              className="w-full banking-button"
            >
              {exchanging ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing Exchange...
                </div>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Exchange Assets
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Portfolio Overview */}
        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Your Crypto Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userWallets.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No crypto wallets found. Start by depositing or exchanging crypto assets.
                </p>
              ) : (
                userWallets.map((wallet) => {
                  const asset = cryptoAssets.find(a => a.symbol === wallet.wallet_type);
                  const usdValue = asset ? wallet.balance * asset.price_usd : 0;
                  
                  return (
                    <div key={wallet.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-lg">{getCryptoIcon(wallet.wallet_type)}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{wallet.wallet_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {wallet.balance.toFixed(6)} {wallet.wallet_type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${usdValue.toLocaleString()}</p>
                        {asset && (
                          <Badge variant={asset.price_change_24h >= 0 ? "default" : "destructive"} className="text-xs">
                            {asset.price_change_24h >= 0 ? '+' : ''}{asset.price_change_24h.toFixed(2)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Overview */}
      <Card className="banking-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cryptoAssets.slice(0, 8).map((asset) => (
              <div key={asset.symbol} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCryptoIcon(asset.symbol)}</span>
                    <span className="font-semibold">{asset.symbol}</span>
                  </div>
                  <Badge variant={asset.price_change_24h >= 0 ? "default" : "destructive"} className="text-xs">
                    {asset.price_change_24h >= 0 ? '+' : ''}{asset.price_change_24h.toFixed(2)}%
                  </Badge>
                </div>
                <p className="text-lg font-bold">{formatPrice(asset.price_usd)}</p>
                <p className="text-xs text-muted-foreground">{asset.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};