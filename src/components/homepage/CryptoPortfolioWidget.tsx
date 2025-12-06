import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Bitcoin, Coins, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  balance: number;
  icon: string;
}

interface CryptoPortfolioWidgetProps {
  compact?: boolean;
}

export const CryptoPortfolioWidget = ({ compact = false }: CryptoPortfolioWidgetProps) => {
  const { user } = useAuth();
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultAssets: CryptoAsset[] = [
    { symbol: "BTC", name: "Bitcoin", price: 43250.00, change24h: 2.45, balance: 0.5234, icon: "₿" },
    { symbol: "ETH", name: "Ethereum", price: 2650.00, change24h: -1.23, balance: 3.2145, icon: "Ξ" },
    { symbol: "USDT", name: "Tether", price: 1.00, change24h: 0.01, balance: 5000.00, icon: "₮" },
    { symbol: "XRP", name: "Ripple", price: 0.62, change24h: 4.56, balance: 1500.00, icon: "✕" },
    { symbol: "SOL", name: "Solana", price: 98.50, change24h: 5.32, balance: 25.00, icon: "◎" },
  ];

  useEffect(() => {
    if (user) {
      fetchUserCryptoWallets();
    } else {
      setCryptoAssets(defaultAssets);
      setLoading(false);
    }
  }, [user]);

  const fetchUserCryptoWallets = async () => {
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
        setCryptoAssets(defaultAssets);
      }
    } catch (error) {
      console.error('Error fetching crypto wallets:', error);
      setCryptoAssets(defaultAssets);
    } finally {
      setLoading(false);
    }
  };

  const getAssetIcon = (symbol: string): string => {
    const icons: Record<string, string> = {
      BTC: "₿",
      ETH: "Ξ",
      USDT: "₮",
      XRP: "✕",
      SOL: "◎",
      USDC: "$",
      BNB: "◆",
      ADA: "₳",
      DOGE: "Ð",
      DOT: "●"
    };
    return icons[symbol] || "○";
  };

  const totalValue = cryptoAssets.reduce((acc, asset) => acc + (asset.price * asset.balance), 0);

  if (loading) {
    return (
      <div className={`bg-heritage-blue/95 backdrop-blur-md rounded-2xl ${compact ? 'p-4' : 'p-6'} border border-heritage-gold/30 shadow-2xl`}>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 text-heritage-gold animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-heritage-blue/95 backdrop-blur-md rounded-2xl ${compact ? 'p-4' : 'p-6'} border border-heritage-gold/30 shadow-2xl`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} bg-heritage-gold/20 rounded-full flex items-center justify-center`}>
            <Bitcoin className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-heritage-gold`} />
          </div>
          <div>
            <h3 className={`${compact ? 'text-base' : 'text-lg'} font-bold text-white`}>Crypto Portfolio</h3>
            <p className="text-heritage-gold/80 text-xs">Heritage Digital Assets</p>
          </div>
        </div>
        <Coins className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} text-heritage-gold`} />
      </div>

      {/* Total Portfolio Value */}
      <div className={`bg-heritage-blue-dark/60 rounded-xl ${compact ? 'p-3' : 'p-4'} mb-4 border border-heritage-gold/20`}>
        <p className="text-heritage-gold/80 text-xs mb-1">Total Portfolio Value</p>
        <p className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-white`}>
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Crypto Assets List */}
      <div className={`space-y-2 sm:space-y-3 ${compact ? 'max-h-40' : 'max-h-64'} overflow-y-auto scrollbar-thin scrollbar-thumb-heritage-gold/30`}>
        {cryptoAssets.slice(0, compact ? 3 : 5).map((asset) => (
          <div 
            key={asset.symbol}
            className={`flex items-center justify-between ${compact ? 'p-2' : 'p-3'} bg-heritage-blue-dark/40 rounded-lg border border-heritage-gold/10 hover:border-heritage-gold/30 transition-all`}
          >
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} bg-heritage-gold/20 rounded-full flex items-center justify-center flex-shrink-0`}>
                <span className={`text-heritage-gold font-bold ${compact ? 'text-xs' : 'text-sm'}`}>{asset.icon}</span>
              </div>
              <div className="min-w-0">
                <p className={`text-white font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>{asset.symbol}</p>
                <p className="text-heritage-gold/60 text-xs truncate">{asset.name}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-white font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
                {asset.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </p>
              <div className="flex items-center justify-end space-x-1">
                <span className="text-heritage-gold/80 text-xs">
                  ${(asset.price * asset.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div className={`flex items-center ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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

      {/* Quick Actions */}
      <div className={`mt-4 grid grid-cols-2 gap-2`}>
        <button className={`bg-heritage-gold/20 hover:bg-heritage-gold/30 text-heritage-gold ${compact ? 'py-1.5 text-xs' : 'py-2 text-sm'} rounded-lg font-semibold transition-all border border-heritage-gold/30`}>
          Buy Crypto
        </button>
        <button className={`bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-blue ${compact ? 'py-1.5 text-xs' : 'py-2 text-sm'} rounded-lg font-semibold transition-all`}>
          Trade Now
        </button>
      </div>
    </div>
  );
};
