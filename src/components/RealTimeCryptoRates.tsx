import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  Bitcoin,
  Zap,
  DollarSign
} from 'lucide-react';

interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  market_cap: number;
  updated_at: string;
}

export const RealTimeCryptoRates = () => {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchCryptoRates();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('crypto_assets_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'crypto_assets' },
        () => {
          fetchCryptoRates();
        }
      )
      .subscribe();

    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      updateCryptoRates();
    }, 30000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const fetchCryptoRates = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_assets')
        .select('*')
        .order('market_cap', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching crypto rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCryptoRates = async () => {
    // Simulate real-time price updates with realistic fluctuations
    const updates = assets.map(asset => {
      const volatility = getVolatility(asset.symbol);
      const changePercent = (Math.random() - 0.5) * volatility;
      const newPrice = asset.current_price * (1 + changePercent / 100);
      const new24hChange = asset.price_change_24h + (Math.random() - 0.5) * 2;
      
      return {
        id: asset.id,
        current_price: Math.max(0.001, newPrice),
        price_change_24h: new24hChange,
        updated_at: new Date().toISOString()
      };
    });

    try {
      for (const update of updates) {
        await supabase
          .from('crypto_assets')
          .update({
            current_price: update.current_price,
            price_change_24h: update.price_change_24h,
            updated_at: update.updated_at
          })
          .eq('id', update.id);
      }
    } catch (error) {
      console.error('Error updating crypto rates:', error);
    }
  };

  const getVolatility = (symbol: string): number => {
    // Different volatility levels for different crypto types
    const volatilityMap: { [key: string]: number } = {
      'BTC': 3,
      'ETH': 4,
      'USDT': 0.1,
      'BNB': 5,
      'ADA': 6,
      'XRP': 5,
      'SOL': 7,
      'DOT': 6,
    };
    return volatilityMap[symbol] || 5;
  };

  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toFixed(4)}`;
    }
  };

  const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(1)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(1)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0.5) return <TrendingUp className="w-4 h-4 text-success" />;
    if (change < -0.5) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
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
      <Card>
        <CardContent className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading crypto rates...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Live Crypto Rates</h2>
          <p className="text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={updateCryptoRates}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {assets.map((asset) => (
          <Card key={asset.id} className="banking-card hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xl">{getCryptoIcon(asset.symbol)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{asset.name}</h3>
                    <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold">{formatPrice(asset.current_price)}</p>
                  <div className="flex items-center gap-1 justify-end">
                    {getPriceChangeIcon(asset.price_change_24h)}
                    <span className={`text-sm font-medium ${
                      asset.price_change_24h > 0 ? 'text-success' : 
                      asset.price_change_24h < 0 ? 'text-destructive' : 
                      'text-muted-foreground'
                    }`}>
                      {asset.price_change_24h > 0 ? '+' : ''}
                      {asset.price_change_24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Market Cap</p>
                  <p className="font-semibold">{formatMarketCap(asset.market_cap)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">24h Volume</p>
                  <p className="font-semibold">{formatMarketCap(asset.volume_24h)}</p>
                </div>
              </div>

              {/* Live indicator */}
              <div className="mt-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Summary */}
      <Card className="banking-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="w-5 h-5" />
            Market Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Market Cap</p>
              <p className="text-2xl font-bold">
                {formatMarketCap(assets.reduce((sum, asset) => sum + asset.market_cap, 0))}
              </p>
            </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-2xl font-bold">N/A</p>
              </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Active Assets</p>
              <p className="text-2xl font-bold">{assets.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};