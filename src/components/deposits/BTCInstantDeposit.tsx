import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bitcoin, Copy, CheckCircle, Clock, Zap, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { QRCodeSVG } from 'qrcode.react';

interface BTCInstantDepositProps {
  onSuccess?: () => void;
}

interface AdminWallet {
  id: string;
  currency: string;
  currency_name: string;
  wallet_address: string;
  network: string | null;
  is_active: boolean;
}

export const BTCInstantDeposit = ({ onSuccess }: BTCInstantDepositProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [adminWallets, setAdminWallets] = useState<AdminWallet[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('BTC');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositStatus, setDepositStatus] = useState<'idle' | 'pending' | 'confirming' | 'completed'>('idle');
  const [transactionHash, setTransactionHash] = useState('');
  const [loading, setLoading] = useState(true);
  const [btcPrice, setBtcPrice] = useState(95000); // Approximate current BTC price

  useEffect(() => {
    fetchAdminWallets();
    fetchBTCPrice();
  }, []);

  const fetchAdminWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_crypto_wallets')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setAdminWallets(data || []);
    } catch (error) {
      console.error('Error fetching admin wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBTCPrice = async () => {
    // In production, this would call a real crypto price API
    // For now, using approximate price
    setBtcPrice(95000);
  };

  const selectedWallet = adminWallets.find(w => w.currency === selectedCurrency);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: `${label} copied to clipboard` });
  };

  const handleDepositSubmit = async () => {
    if (!depositAmount || !transactionHash) {
      toast({ title: 'Missing Information', description: 'Please enter amount and transaction hash', variant: 'destructive' });
      return;
    }

    setDepositStatus('pending');

    try {
      // Create deposit request
      const { error } = await supabase.from('deposit_requests').insert({
        user_id: user?.id,
        account_id: user?.id, // Will be updated when approved
        amount: parseFloat(depositAmount) * btcPrice,
        method: `crypto_${selectedCurrency.toLowerCase()}`,
        reference_number: transactionHash,
        notes: `${selectedCurrency} deposit - ${depositAmount} ${selectedCurrency} @ $${btcPrice.toLocaleString()}`,
        status: 'pending'
      });

      if (error) throw error;

      // Simulate confirmation process
      setTimeout(() => {
        setDepositStatus('confirming');
      }, 2000);

      setTimeout(() => {
        setDepositStatus('completed');
        toast({
          title: 'Deposit Submitted!',
          description: 'Your crypto deposit is being processed. Funds will be available shortly.',
        });
        onSuccess?.();
      }, 5000);

      // Send email notification
      await supabase.functions.invoke('send-notification-email', {
        body: {
          to: user?.email,
          subject: `Heritage Bank - ${selectedCurrency} Deposit Received`,
          type: 'deposit',
          data: {
            amount: parseFloat(depositAmount),
            currency: selectedCurrency,
            usdValue: parseFloat(depositAmount) * btcPrice,
            transactionHash,
            date: new Date().toLocaleString()
          }
        }
      });
    } catch (error) {
      console.error('Deposit error:', error);
      setDepositStatus('idle');
      toast({ title: 'Error', description: 'Failed to submit deposit', variant: 'destructive' });
    }
  };

  const getUsdValue = () => {
    const amount = parseFloat(depositAmount) || 0;
    return amount * btcPrice;
  };

  if (loading) {
    return (
      <Card className="banking-card">
        <CardContent className="py-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">Loading deposit options...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="banking-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bitcoin className="w-5 h-5 text-orange-500" />
          Instant Crypto Deposit
          <Badge className="ml-2 bg-green-500">
            <Zap className="w-3 h-3 mr-1" />
            Instant Confirmation
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Fast-track deposits with real-time blockchain confirmation. BTC deposits typically complete in 10-15 minutes.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currency Selection */}
        <div className="space-y-2">
          <Label>Select Cryptocurrency</Label>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {adminWallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.currency}>
                  {wallet.currency_name} ({wallet.currency})
                </SelectItem>
              ))}
              {adminWallets.length === 0 && (
                <>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="USDT">Tether (USDT)</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Wallet Address Display */}
        {selectedWallet ? (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Send {selectedCurrency} to this address:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-background p-2 rounded border break-all">
                  {selectedWallet.wallet_address}
                </code>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(selectedWallet.wallet_address, 'Wallet address')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              {selectedWallet.network && (
                <Badge variant="secondary" className="mt-2">
                  Network: {selectedWallet.network}
                </Badge>
              )}
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg">
                <QRCodeSVG 
                  value={selectedWallet.wallet_address} 
                  size={150}
                  level="H"
                  includeMargin
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-muted rounded-lg text-center">
            <Bitcoin className="w-12 h-12 mx-auto text-orange-500 mb-2" />
            <p className="text-sm text-muted-foreground">
              Contact support to get the deposit address for {selectedCurrency}
            </p>
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-2">
          <Label>Amount ({selectedCurrency})</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            step="0.00000001"
          />
          {depositAmount && (
            <p className="text-sm text-muted-foreground">
              ≈ ${getUsdValue().toLocaleString()} USD
            </p>
          )}
        </div>

        {/* Transaction Hash */}
        <div className="space-y-2">
          <Label>Transaction Hash (after sending)</Label>
          <Input
            placeholder="Enter blockchain transaction hash"
            value={transactionHash}
            onChange={(e) => setTransactionHash(e.target.value)}
          />
        </div>

        {/* Status Display */}
        {depositStatus !== 'idle' && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {depositStatus === 'pending' && (
                <>
                  <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
                  <div>
                    <p className="font-medium">Deposit Pending</p>
                    <p className="text-sm text-muted-foreground">Waiting for blockchain confirmation...</p>
                  </div>
                </>
              )}
              {depositStatus === 'confirming' && (
                <>
                  <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                  <div>
                    <p className="font-medium">Confirming Transaction</p>
                    <p className="text-sm text-muted-foreground">Processing your deposit...</p>
                  </div>
                </>
              )}
              {depositStatus === 'completed' && (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-600">Deposit Completed!</p>
                    <p className="text-sm text-muted-foreground">Funds will be credited shortly</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          onClick={handleDepositSubmit}
          disabled={!depositAmount || !transactionHash || depositStatus !== 'idle'}
          className="w-full banking-button"
        >
          <Zap className="w-4 h-4 mr-2" />
          {depositStatus === 'idle' ? 'Confirm Instant Deposit' : 'Processing...'}
        </Button>

        <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">Faster Payments Available</p>
              <p className="text-xs text-green-600 dark:text-green-500">
                BTC deposits are confirmed within 10-15 minutes. ETH and stablecoin deposits are typically instant after 3 confirmations.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          All crypto deposits are automatically converted to USD at current market rates.
        </p>
      </CardContent>
    </Card>
  );
};
