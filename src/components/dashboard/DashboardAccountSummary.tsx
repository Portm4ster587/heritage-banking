import { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, Check, Building2, Loader2, Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, TrendingUp, TrendingDown, Bitcoin, Coins, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { HeritageSVGLogo } from '@/components/HeritageSVGLogo';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LinkedCardsDisplay } from '@/components/LinkedCardsDisplay';

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  routing_number: string;
  balance: number | null;
  status: string | null;
}

interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  balance: number;
  icon: string;
}

export const DashboardAccountSummary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([]);
  const [cryptoLoading, setCryptoLoading] = useState(true);

  const heritageRouting = "021000021";

  const defaultCryptoAssets: CryptoAsset[] = [
    { symbol: "BTC", name: "Bitcoin", price: 43250.00, change24h: 2.45, balance: 0.5234, icon: "₿" },
    { symbol: "ETH", name: "Ethereum", price: 2650.00, change24h: -1.23, balance: 3.2145, icon: "Ξ" },
    { symbol: "USDT", name: "Tether", price: 1.00, change24h: 0.01, balance: 5000.00, icon: "₮" },
    { symbol: "XRP", name: "Ripple", price: 0.62, change24h: 4.56, balance: 1500.00, icon: "✕" },
    { symbol: "SOL", name: "Solana", price: 98.50, change24h: 5.32, balance: 25.00, icon: "◎" },
  ];

  useEffect(() => {
    if (user) {
      fetchAccounts();
      fetchCryptoWallets();

      // Real-time subscription for balance updates
      const channel = supabase
        .channel('dashboard-balance-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'accounts',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Account update received:', payload);
            fetchAccounts();
            setLastUpdate(new Date());
            toast({
              title: "Balance Updated",
              description: "Your account balance has been updated.",
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transfers',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Transfer detected:', payload);
            setTimeout(() => fetchAccounts(), 1000);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCryptoWallets = async () => {
    try {
      const { data: wallets, error } = await supabase
        .from('crypto_wallets')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      const { data: assets } = await supabase
        .from('crypto_assets')
        .select('*');

      if (wallets && wallets.length > 0 && assets) {
        const userAssets = wallets.map(wallet => {
          const assetInfo = assets.find(a => a.symbol === wallet.asset_symbol);
          return {
            symbol: wallet.asset_symbol,
            name: assetInfo?.name || wallet.asset_symbol,
            price: assetInfo?.current_price || 0,
            change24h: assetInfo?.price_change_24h || 0,
            balance: wallet.balance || 0,
            icon: getAssetIcon(wallet.asset_symbol)
          };
        });
        setCryptoAssets(userAssets);
      } else {
        setCryptoAssets(defaultCryptoAssets);
      }
    } catch (error) {
      console.error('Error fetching crypto wallets:', error);
      setCryptoAssets(defaultCryptoAssets);
    } finally {
      setCryptoLoading(false);
    }
  };

  const getAssetIcon = (symbol: string): string => {
    const icons: Record<string, string> = {
      BTC: "₿", ETH: "Ξ", USDT: "₮", XRP: "✕", SOL: "◎",
      USDC: "$", BNB: "◆", ADA: "₳", DOGE: "Ð", DOT: "●"
    };
    return icons[symbol] || "○";
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: "Copied!",
      description: `${field} copied to clipboard`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatAccountType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance ?? 0), 0);
  const primaryAccount = accounts[0];
  const accountNumber = primaryAccount?.account_number || '••••••••';
  const cryptoTotalValue = cryptoAssets.reduce((acc, asset) => acc + (asset.price * asset.balance), 0);

  if (loading) {
    return (
      <div className="bg-heritage-blue-dark rounded-2xl overflow-hidden shadow-2xl border border-heritage-gold/20">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-heritage-gold animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Summary Grid - Account Balance + Crypto Portfolio Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Account Summary Card - Heritage Navy Blue Design */}
        <div className="bg-heritage-blue-dark rounded-2xl overflow-hidden shadow-2xl border border-heritage-gold/20">
          {/* Header with Logo */}
          <div className="bg-gradient-to-r from-heritage-blue to-heritage-blue-dark p-6 border-b border-heritage-gold/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <HeritageSVGLogo size="lg" className="animate-pulse" />
                <div>
                  <h3 className="text-2xl font-bold text-heritage-gold tracking-wide">HERITAGE</h3>
                  <p className="text-heritage-gold/80 text-xs">BANK</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-heritage-gold/60 text-xs">Heritage US</p>
                <p className="text-primary-foreground font-mono text-sm">Ecosystem Account</p>
              </div>
            </div>
          </div>

          {/* Balance Section - Navy Blue */}
          <div className="bg-heritage-blue p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-heritage-gold/80 text-sm font-medium">Available Balance</p>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="text-heritage-gold hover:text-heritage-gold/80 transition-colors"
              >
                {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-2 tracking-wide">
              {showBalance ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••••'}
            </p>
            <p className="text-heritage-gold/60 text-xs">USD - United States Dollar</p>
            {accounts.length > 1 && (
              <p className="text-heritage-gold/80 text-xs mt-2">{accounts.length} active accounts</p>
            )}
            
            {/* Last Update Time */}
            <div className="mt-4 flex items-center gap-2 text-xs text-primary-foreground/50">
              <RefreshCw className="w-3 h-3" />
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-heritage-blue-dark p-6 space-y-4">
            {/* Account Number */}
            <div className="bg-heritage-blue rounded-xl p-4 border border-heritage-gold/10">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-heritage-gold/60 text-xs mb-1">Account Number</p>
                  <p className="text-primary-foreground font-mono text-lg tracking-wider truncate">
                    {showBalance ? accountNumber : '•••• •••• ••••'}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(accountNumber, 'account')}
                  className="text-heritage-gold hover:text-heritage-gold/80 transition-colors p-2 flex-shrink-0"
                >
                  {copiedField === 'account' ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Routing Number */}
            <div className="bg-heritage-blue rounded-xl p-4 border border-heritage-gold/10">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-heritage-gold/60 text-xs mb-1">Heritage US Routing Number</p>
                  <p className="text-primary-foreground font-mono text-lg tracking-wider">{heritageRouting}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(heritageRouting, 'routing')}
                  className="text-heritage-gold hover:text-heritage-gold/80 transition-colors p-2 flex-shrink-0"
                >
                  {copiedField === 'routing' ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Bank Info */}
            <div className="bg-heritage-blue rounded-xl p-4 border border-heritage-gold/10">
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-heritage-gold flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-heritage-gold/60 text-xs">Bank Name</p>
                  <p className="text-primary-foreground font-semibold text-base truncate">Heritage Bank US</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-heritage-blue to-heritage-blue-dark p-4 border-t border-heritage-gold/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-heritage-gold/60">FDIC Insured • Member FDIC</span>
              <span className="text-heritage-gold font-semibold">Since 1892</span>
            </div>
          </div>
        </div>

        {/* Crypto Portfolio Widget - Same Heritage Design */}
        <div className="bg-heritage-blue backdrop-blur-md rounded-2xl p-6 border border-heritage-gold/30 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-heritage-gold/20 rounded-full flex items-center justify-center">
                <Bitcoin className="w-5 h-5 text-heritage-gold" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-foreground">Crypto Portfolio</h3>
                <p className="text-heritage-gold/80 text-xs">Heritage Digital Assets</p>
              </div>
            </div>
            <Coins className="w-6 h-6 text-heritage-gold" />
          </div>

          {/* Total Portfolio Value */}
          <div className="bg-heritage-blue-dark rounded-xl p-4 mb-4 border border-heritage-gold/20">
            <p className="text-heritage-gold/80 text-xs mb-1">Total Portfolio Value</p>
            <p className="text-2xl font-bold text-primary-foreground">
              ${cryptoTotalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Crypto Assets List */}
          {cryptoLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 text-heritage-gold animate-spin" />
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-heritage-gold/30">
              {cryptoAssets.slice(0, 5).map((asset) => (
                <div 
                  key={asset.symbol}
                  className="flex items-center justify-between p-3 bg-heritage-blue-dark/60 rounded-lg border border-heritage-gold/10 hover:border-heritage-gold/30 transition-all"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 bg-heritage-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-heritage-gold font-bold text-sm">{asset.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-primary-foreground font-semibold text-sm">{asset.symbol}</p>
                      <p className="text-heritage-gold/60 text-xs truncate">{asset.name}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-primary-foreground font-semibold text-sm">
                      {asset.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </p>
                    <div className="flex items-center justify-end space-x-1">
                      <span className="text-heritage-gold/80 text-xs">
                        ${(asset.price * asset.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <div className={`flex items-center ${asset.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {asset.change24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span className="text-xs ml-0.5">{Math.abs(asset.change24h)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="bg-heritage-gold/20 hover:bg-heritage-gold/30 text-heritage-gold py-2 text-sm rounded-lg font-semibold transition-all border border-heritage-gold/30">
              Buy Crypto
            </button>
            <button className="bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-blue-dark py-2 text-sm rounded-lg font-semibold transition-all">
              Trade Now
            </button>
          </div>
        </div>
      </div>

      {/* Individual Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <Card 
            key={account.id} 
            className="bg-heritage-blue border-heritage-gold/20 hover:border-heritage-gold/40 transition-all duration-300"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-heritage-gold/20 text-heritage-gold border-heritage-gold/30">
                  {formatAccountType(account.account_type)}
                </Badge>
                <span className="text-xs text-primary-foreground/50">Active</span>
              </div>
              
              {/* Balance */}
              <p className="text-2xl font-bold text-primary-foreground mb-4">
                {showBalance 
                  ? `$${(account.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : '••••••'
                }
              </p>
              
              {/* Account Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-primary-foreground/5 rounded-lg">
                  <div>
                    <p className="text-xs text-primary-foreground/50">Account Number</p>
                    <p className="text-sm text-primary-foreground font-mono">
                      {showBalance 
                        ? account.account_number 
                        : `****${account.account_number.slice(-4)}`
                      }
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(account.account_number, `acc-${account.id}`)}
                    className="text-primary-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 p-0"
                  >
                    {copiedField === `acc-${account.id}` ? (
                      <Check className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-primary-foreground/5 rounded-lg">
                  <div>
                    <p className="text-xs text-primary-foreground/50">Routing Number</p>
                    <p className="text-sm text-primary-foreground font-mono">
                      {account.routing_number || heritageRouting}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(account.routing_number || heritageRouting, `rtn-${account.id}`)}
                    className="text-primary-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 p-0"
                  >
                    {copiedField === `rtn-${account.id}` ? (
                      <Check className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Linked Cards Section */}
      <LinkedCardsDisplay />
    </div>
  );
};