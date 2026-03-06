import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, User, CheckCircle, Loader2, AlertCircle, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { HeritageSVGLogoTransparent } from '@/components/HeritageSVGLogoTransparent';

interface CryptoInternalTransferProps {
  wallets: any[];
  onSuccess?: () => void;
}

export const CryptoInternalTransfer = ({ wallets, onSuccess }: CryptoInternalTransferProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedAsset, setSelectedAsset] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [recipientVerified, setRecipientVerified] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState<{name: string; symbol: string} | null>(null);

  // Generate Heritage ecosystem wallet address format - all numeric
  const generateHeritageWalletAddress = (symbol: string, userId: string) => {
    const hexToDigits = (hex: string) => {
      return hex.split('').map(c => {
        const code = c.charCodeAt(0);
        if (code >= 48 && code <= 57) return c;
        return String(code % 10);
      }).join('');
    };
    const raw = userId.replace(/-/g, '');
    return hexToDigits(raw).substring(0, 20);
  };

  // Auto-lookup recipient when address changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (recipientAddress.length >= 15 && /^\d+$/.test(recipientAddress)) {
        handleRecipientLookup();
      } else {
        setRecipientVerified(false);
        setRecipientInfo(null);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [recipientAddress]);

  const handleRecipientLookup = async () => {
    setLookupLoading(true);
    try {
      // Extract user ID and symbol from Heritage wallet address
      const isHeritageNumeric = /^\d{15,20}$/.test(recipientAddress);
      
      if (isHeritageNumeric) {
        // Look up wallet in the system
        const { data: wallet, error } = await supabase
          .from('crypto_wallets')
          .select('user_id, asset_symbol')
          .eq('wallet_address', recipientAddress)
          .maybeSingle();

        if (wallet) {
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', wallet.user_id)
            .maybeSingle();

          if (profile) {
            const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Heritage Member';
            setRecipientInfo({ name, symbol: wallet.asset_symbol });
            setRecipientVerified(true);
          }
        } else {
          setRecipientVerified(false);
          setRecipientInfo(null);
        }
      }
    } catch (error) {
      console.error('Lookup error:', error);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedAsset || !recipientAddress || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!recipientVerified) {
      toast({
        title: "Invalid Recipient",
        description: "Please enter a valid recipient wallet ID",
        variant: "destructive"
      });
      return;
    }

    const transferAmount = parseFloat(amount);
    const sourceWallet = wallets.find(w => w.asset_symbol === selectedAsset);
    
    if (!sourceWallet || (sourceWallet.balance ?? 0) < transferAmount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this transfer",
        variant: "destructive"
      });
      return;
    }

    setIsTransferring(true);

    try {
      // Use edge function with service role to handle both sender and recipient updates
      const { data, error } = await supabase.functions.invoke('process-crypto-transfer', {
        body: {
          senderWalletId: sourceWallet.id,
          recipientWalletAddress: recipientAddress,
          amount: transferAmount,
          assetSymbol: selectedAsset
        }
      });

      if (error) throw new Error(error.message || 'Transfer failed');
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Transfer Complete",
        description: `Successfully sent ${transferAmount} ${selectedAsset} to ${recipientInfo?.name}`,
      });

      // Reset form
      setAmount('');
      setRecipientAddress('');
      setRecipientVerified(false);
      setRecipientInfo(null);
      
      onSuccess?.();

    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "Failed to process transfer",
        variant: "destructive"
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const getWalletBalance = (symbol: string) => {
    const wallet = wallets.find(w => w.asset_symbol === symbol);
    return wallet?.balance || 0;
  };

  const availableAssets = ['BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'XRP', 'BNB'];

  return (
    <Card className="hightech-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Send className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span>Send Crypto</span>
            <Badge variant="outline" className="ml-2 text-xs">Instant</Badge>
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Send crypto instantly to other Heritage members
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Removed ecosystem address info box - seamless internal transfer */}

        <div className="space-y-2">
          <Label>Select Asset</Label>
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Choose cryptocurrency" />
            </SelectTrigger>
            <SelectContent>
              {availableAssets.map((symbol) => {
                const balance = getWalletBalance(symbol);
                return (
                  <SelectItem key={symbol} value={symbol}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span className="font-medium">{symbol}</span>
                      <span className="text-sm text-muted-foreground">
                        Balance: {balance.toFixed(6)}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Recipient Wallet ID</Label>
          <div className="relative">
            <Input
              placeholder="Enter recipient wallet ID"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="h-12 pr-10 font-mono text-sm"
            />
            {lookupLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            )}
            {recipientVerified && !lookupLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            )}
          </div>

          {recipientInfo && recipientVerified && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">
                    {recipientInfo.name}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-500">
                    Verified Member • {recipientInfo.symbol}
                    <Badge className="ml-2 bg-green-500/20 text-green-600 text-xs">Verified</Badge>
                  </p>
                </div>
              </div>
            </div>
          )}

          {recipientAddress.length >= 10 && !recipientVerified && !lookupLoading && !/^\d+$/.test(recipientAddress) && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Invalid wallet ID format. Please check and try again.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            placeholder="0.00000000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.00000001"
            min="0"
            className="h-12 font-mono"
          />
          {selectedAsset && (
            <p className="text-xs text-muted-foreground">
              Available: {getWalletBalance(selectedAsset).toFixed(8)} {selectedAsset}
            </p>
          )}
        </div>

        <Button
          onClick={handleTransfer}
          disabled={isTransferring || !selectedAsset || !recipientAddress || !amount || !recipientVerified}
          className="w-full banking-button h-12"
        >
          {isTransferring ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send {selectedAsset || 'Crypto'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};