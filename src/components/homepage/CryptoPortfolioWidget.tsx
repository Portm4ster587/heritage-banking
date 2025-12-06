import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Bitcoin, Coins } from "lucide-react";

interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  balance: number;
  icon: string;
}

export const CryptoPortfolioWidget = () => {
  const [cryptoAssets] = useState<CryptoAsset[]>([
    { symbol: "BTC", name: "Bitcoin", price: 43250.00, change24h: 2.45, balance: 0.5234, icon: "₿" },
    { symbol: "ETH", name: "Ethereum", price: 2650.00, change24h: -1.23, balance: 3.2145, icon: "Ξ" },
    { symbol: "USDT", name: "Tether", price: 1.00, change24h: 0.01, balance: 5000.00, icon: "₮" },
    { symbol: "XRP", name: "Ripple", price: 0.62, change24h: 4.56, balance: 1500.00, icon: "✕" },
    { symbol: "SOL", name: "Solana", price: 98.50, change24h: 5.32, balance: 25.00, icon: "◎" },
  ]);

  const totalValue = cryptoAssets.reduce((acc, asset) => acc + (asset.price * asset.balance), 0);

  return (
    <div className="bg-heritage-blue/95 backdrop-blur-md rounded-2xl p-6 border border-heritage-gold/30 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-heritage-gold/20 rounded-full flex items-center justify-center">
            <Bitcoin className="w-5 h-5 text-heritage-gold" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Crypto Portfolio</h3>
            <p className="text-heritage-gold/80 text-xs">Heritage Digital Assets</p>
          </div>
        </div>
        <Coins className="w-6 h-6 text-heritage-gold" />
      </div>

      {/* Total Portfolio Value */}
      <div className="bg-heritage-blue-dark/60 rounded-xl p-4 mb-4 border border-heritage-gold/20">
        <p className="text-heritage-gold/80 text-xs mb-1">Total Portfolio Value</p>
        <p className="text-2xl font-bold text-white">
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Crypto Assets List */}
      <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-heritage-gold/30">
        {cryptoAssets.map((asset) => (
          <div 
            key={asset.symbol}
            className="flex items-center justify-between p-3 bg-heritage-blue-dark/40 rounded-lg border border-heritage-gold/10 hover:border-heritage-gold/30 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-heritage-gold/20 rounded-full flex items-center justify-center">
                <span className="text-heritage-gold font-bold text-sm">{asset.icon}</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{asset.symbol}</p>
                <p className="text-heritage-gold/60 text-xs">{asset.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold text-sm">
                {asset.balance.toLocaleString('en-US', { minimumFractionDigits: 4 })}
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
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="bg-heritage-gold/20 hover:bg-heritage-gold/30 text-heritage-gold py-2 rounded-lg text-sm font-semibold transition-all border border-heritage-gold/30">
          Buy Crypto
        </button>
        <button className="bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-blue py-2 rounded-lg text-sm font-semibold transition-all">
          Trade Now
        </button>
      </div>
    </div>
  );
};
