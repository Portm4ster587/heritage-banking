import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, QrCode, Wallet, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { HeritageSVGLogoTransparent } from '@/components/HeritageSVGLogoTransparent';
import { QRCodeCanvas } from 'qrcode.react';

interface HeritageWalletAddressProps {
  wallets: any[];
  onWalletsUpdate?: () => void;
}

export const HeritageWalletAddress = ({ wallets, onWalletsUpdate }: HeritageWalletAddressProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [copied, setCopied] = useState(false);

  // Generate Heritage ecosystem wallet address - all numeric
  const generateHeritageAddress = (symbol: string, userId: string) => {
    // Convert UUID hex chars to digits for a pure numeric address
    const hexToDigits = (hex: string) => {
      return hex.split('').map(c => {
        const code = c.charCodeAt(0);
        if (code >= 48 && code <= 57) return c; // 0-9
        return String(code % 10); // a-f -> digit
      }).join('');
    };
    const raw = userId.replace(/-/g, '');
    const digits = hexToDigits(raw);
    // 20-digit unique address
    return digits.substring(0, 20);
  };

  // Get or create wallet address
  const getWalletAddress = (symbol: string) => {
    const wallet = wallets.find(w => w.asset_symbol === symbol);
    if (wallet?.wallet_address) {
      return wallet.wallet_address;
    }
    // Generate new Heritage ecosystem address
    return user?.id ? generateHeritageAddress(symbol, user.id) : '';
  };

  // Ensure wallet exists with Heritage address
  useEffect(() => {
    const ensureWalletExists = async () => {
      if (!user?.id) return;
      
      const existingWallet = wallets.find(w => w.asset_symbol === selectedAsset);
      const heritageAddress = generateHeritageAddress(selectedAsset, user.id);
      
      if (!existingWallet) {
        // Create new wallet with Heritage ecosystem address
        const { error } = await supabase
          .from('crypto_wallets')
          .insert([{
            user_id: user.id,
            asset_symbol: selectedAsset,
            balance: 0,
            wallet_address: heritageAddress
          }]);
          
        if (!error && onWalletsUpdate) {
          onWalletsUpdate();
        }
      } else if (!existingWallet.wallet_address || /[a-zA-Z]/.test(existingWallet.wallet_address)) {
        // Update existing wallet with Heritage address
        const { error } = await supabase
          .from('crypto_wallets')
          .update({ wallet_address: heritageAddress })
          .eq('id', existingWallet.id);
          
        if (!error && onWalletsUpdate) {
          onWalletsUpdate();
        }
      }
    };

    ensureWalletExists();
  }, [selectedAsset, user?.id, wallets]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const currentAddress = getWalletAddress(selectedAsset);
  const currentBalance = wallets.find(w => w.asset_symbol === selectedAsset)?.balance || 0;

  const assets = [
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: 'from-orange-500 to-amber-500' },
    { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'from-blue-500 to-indigo-500' },
    { symbol: 'USDT', name: 'Tether', icon: '₮', color: 'from-green-500 to-emerald-500' },
    { symbol: 'USDC', name: 'USD Coin', icon: '$', color: 'from-blue-400 to-cyan-500' },
    { symbol: 'SOL', name: 'Solana', icon: '◎', color: 'from-purple-500 to-fuchsia-500' },
    { symbol: 'XRP', name: 'Ripple', icon: '✕', color: 'from-slate-500 to-zinc-600' },
  ];

  const selectedAssetInfo = assets.find(a => a.symbol === selectedAsset);

  return (
    <Card className="hightech-card overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span>Receive Crypto</span>
            <Badge variant="outline" className="ml-2 text-xs">Instant</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Asset Selector */}
        <Tabs value={selectedAsset} onValueChange={setSelectedAsset}>
          <TabsList className="grid grid-cols-6 h-12">
            {assets.map((asset) => (
              <TabsTrigger 
                key={asset.symbol} 
                value={asset.symbol}
                className="text-lg"
              >
                {asset.icon}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Address Display */}
        <div className={`p-6 rounded-xl bg-gradient-to-br ${selectedAssetInfo?.color} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-4">
              <HeritageSVGLogoTransparent size="sm" className="w-8 h-8" />
              <span className="text-white font-bold text-lg">{selectedAsset} Wallet</span>
            </div>
            
            {/* QR Code */}
            <div className="bg-white p-4 rounded-xl mb-4 shadow-xl">
              <QRCodeCanvas 
                value={currentAddress}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Address */}
            <div className="w-full">
              <p className="text-white/70 text-xs mb-2">Your Heritage {selectedAsset} Address</p>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-lg p-3">
                <code className="text-white text-xs font-mono flex-1 break-all">
                  {currentAddress}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(currentAddress)}
                  className="text-white hover:bg-white/20 shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Balance */}
            <div className="mt-4 text-center">
              <p className="text-white/70 text-xs">Current Balance</p>
              <p className="text-white font-bold text-xl">
                {currentBalance.toFixed(8)} {selectedAsset}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">How to receive {selectedAsset}:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Share your Heritage ecosystem address with the sender</li>
            <li>Funds transfer instantly between Heritage members</li>
            <li>All transactions are secured and verified in real-time</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};