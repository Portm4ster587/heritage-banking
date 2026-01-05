import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bitcoin, CreditCard, Building2, ArrowDownCircle, Smartphone, FileText, Banknote, Copy, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
}

interface CryptoWallet {
  id: string;
  currency: string;
  currency_name: string;
  wallet_address: string;
  network: string;
}

interface EnhancedDepositFormProps {
  accounts: Account[];
  onSuccess?: () => void;
}

export const EnhancedDepositForm = ({ accounts, onSuccess }: EnhancedDepositFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  
  // Card form fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Bank form fields
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  
  // Check deposit fields
  const [checkNumber, setCheckNumber] = useState('');
  const [payerName, setPayerName] = useState('');
  
  // ACH fields
  const [achRoutingNumber, setAchRoutingNumber] = useState('');
  const [achAccountNumber, setAchAccountNumber] = useState('');
  const [achBankName, setAchBankName] = useState('');

  useEffect(() => {
    fetchCryptoWallets();
  }, []);

  const fetchCryptoWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_crypto_wallets')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setCryptoWallets(data || []);
    } catch (error) {
      console.error('Error fetching crypto wallets:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Wallet address copied to clipboard" });
  };

  const handleCryptoDeposit = async () => {
    if (!amount || !selectedAccount || !selectedCrypto) {
      toast({ title: "Missing Information", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      await supabase.from('deposit_requests').insert({
        user_id: user?.id,
        account_id: selectedAccount,
        amount: parseFloat(amount),
        method: 'crypto',
        status: 'pending',
        reference_number: `CRYPTO-${Date.now()}`,
        notes: `${selectedCrypto} deposit - awaiting confirmation`
      });

      toast({
        title: "Deposit Request Submitted",
        description: "Please send the exact amount to the wallet address shown. Your deposit will be credited once confirmed.",
      });
      
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error('Deposit error:', error);
      toast({ title: "Error", description: "Failed to submit deposit request", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardDeposit = async () => {
    if (!amount || !selectedAccount || !cardNumber || !expiryDate || !cvv) {
      toast({ title: "Missing Information", description: "Please fill all card details", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      await supabase.from('deposit_requests').insert({
        user_id: user?.id,
        account_id: selectedAccount,
        amount: parseFloat(amount),
        method: 'card',
        status: 'pending',
        reference_number: `CARD-${Date.now()}`,
        notes: `Card ending in ${cardNumber.slice(-4)}`
      });

      toast({
        title: "Card Deposit Submitted",
        description: "Your deposit is being processed and will be credited shortly.",
      });
      
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error('Deposit error:', error);
      toast({ title: "Error", description: "Failed to process card deposit", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckDeposit = async () => {
    if (!amount || !selectedAccount || !checkNumber || !payerName) {
      toast({ title: "Missing Information", description: "Please fill all check details", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      await supabase.from('check_deposits').insert({
        user_id: user?.id,
        account_id: selectedAccount,
        amount: parseFloat(amount),
        check_number: checkNumber,
        payer_name: payerName,
        status: 'pending'
      });

      toast({
        title: "Check Deposit Submitted",
        description: "Your mobile check deposit is under review and will be processed within 1-2 business days.",
      });
      
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error('Check deposit error:', error);
      toast({ title: "Error", description: "Failed to submit check deposit", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleACHDeposit = async () => {
    if (!amount || !selectedAccount || !achRoutingNumber || !achAccountNumber || !achBankName) {
      toast({ title: "Missing Information", description: "Please fill all ACH details", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      await supabase.from('ach_transfers').insert({
        user_id: user?.id,
        account_id: selectedAccount,
        amount: parseFloat(amount),
        transfer_direction: 'inbound',
        ach_type: 'standard',
        status: 'pending',
        reference_number: `ACH-${Date.now()}`,
        description: `ACH from ${achBankName}`
      });

      toast({
        title: "ACH Transfer Initiated",
        description: "Your ACH deposit will be processed within 2-3 business days.",
      });
      
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error('ACH error:', error);
      toast({ title: "Error", description: "Failed to initiate ACH transfer", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBankTransfer = async () => {
    if (!amount || !selectedAccount || !bankName || !routingNumber || !accountNumber) {
      toast({ title: "Missing Information", description: "Please fill all bank details", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      await supabase.from('deposit_requests').insert({
        user_id: user?.id,
        account_id: selectedAccount,
        amount: parseFloat(amount),
        method: 'bank_transfer',
        status: 'pending',
        reference_number: `BANK-${Date.now()}`,
        notes: `Bank transfer from ${bankName}`
      });

      toast({
        title: "Bank Transfer Request Submitted",
        description: "Your bank transfer is pending confirmation.",
      });
      
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error('Bank transfer error:', error);
      toast({ title: "Error", description: "Failed to submit bank transfer", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setBankName('');
    setRoutingNumber('');
    setAccountNumber('');
    setCheckNumber('');
    setPayerName('');
    setAchRoutingNumber('');
    setAchAccountNumber('');
    setAchBankName('');
  };

  const selectedWallet = cryptoWallets.find(w => w.currency === selectedCrypto);

  return (
    <Card className="banking-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownCircle className="w-5 h-5 text-primary" />
          Deposit Funds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Deposit Amount</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label>Destination Account</Label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.account_type.replace('_', ' ')} (...{account.account_number.slice(-4)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="crypto" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="crypto" className="text-xs">
              <Bitcoin className="w-4 h-4 mr-1" />Crypto
            </TabsTrigger>
            <TabsTrigger value="card" className="text-xs">
              <CreditCard className="w-4 h-4 mr-1" />Card
            </TabsTrigger>
            <TabsTrigger value="check" className="text-xs">
              <FileText className="w-4 h-4 mr-1" />Check
            </TabsTrigger>
            <TabsTrigger value="ach" className="text-xs">
              <Banknote className="w-4 h-4 mr-1" />ACH
            </TabsTrigger>
            <TabsTrigger value="bank" className="text-xs">
              <Building2 className="w-4 h-4 mr-1" />Wire
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crypto" className="space-y-4">
            <div className="space-y-2">
              <Label>Select Cryptocurrency</Label>
              <div className="flex flex-wrap gap-2">
                {cryptoWallets.map((wallet) => (
                  <Button
                    key={wallet.currency}
                    variant={selectedCrypto === wallet.currency ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCrypto(wallet.currency)}
                  >
                    {wallet.currency}
                  </Button>
                ))}
              </div>
            </div>
            
            {selectedWallet && selectedWallet.wallet_address !== 'pending_admin_setup' && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Send {selectedCrypto} to:</span>
                  <Badge variant="outline">{selectedWallet.network}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-background p-2 rounded border break-all">
                    {selectedWallet.wallet_address}
                  </code>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(selectedWallet.wallet_address)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Send exactly ${amount || '0'} worth of {selectedCrypto} to this address
                </p>
              </div>
            )}
            
            {selectedWallet && selectedWallet.wallet_address === 'pending_admin_setup' && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  {selectedCrypto} deposits are currently unavailable. Please try another method.
                </p>
              </div>
            )}

            <Button 
              onClick={handleCryptoDeposit}
              disabled={isProcessing || !selectedWallet || selectedWallet.wallet_address === 'pending_admin_setup'}
              className="w-full banking-button"
            >
              {isProcessing ? "Processing..." : `Submit ${selectedCrypto} Deposit`}
            </Button>
          </TabsContent>

          <TabsContent value="card" className="space-y-4">
            <div className="space-y-2">
              <Label>Card Number</Label>
              <Input placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} maxLength={19} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input placeholder="MM/YY" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} maxLength={5} />
              </div>
              <div className="space-y-2">
                <Label>CVV</Label>
                <Input placeholder="123" value={cvv} onChange={(e) => setCvv(e.target.value)} maxLength={4} type="password" />
              </div>
            </div>
            <Button onClick={handleCardDeposit} disabled={isProcessing} className="w-full banking-button">
              {isProcessing ? "Processing..." : `Deposit $${amount || '0'}`}
            </Button>
          </TabsContent>

          <TabsContent value="check" className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                📱 Mobile Check Deposit - Take photos of your check to deposit funds
              </p>
            </div>
            <div className="space-y-2">
              <Label>Check Number</Label>
              <Input placeholder="Check number" value={checkNumber} onChange={(e) => setCheckNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Payer Name</Label>
              <Input placeholder="Name on the check" value={payerName} onChange={(e) => setPayerName(e.target.value)} />
            </div>
            <Button onClick={handleCheckDeposit} disabled={isProcessing} className="w-full banking-button">
              {isProcessing ? "Processing..." : "Submit Check Deposit"}
            </Button>
          </TabsContent>

          <TabsContent value="ach" className="space-y-4">
            <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-xs text-green-800 dark:text-green-200">
                ACH transfers typically take 2-3 business days to process
              </p>
            </div>
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input placeholder="Your bank name" value={achBankName} onChange={(e) => setAchBankName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Routing Number</Label>
              <Input placeholder="9-digit routing number" value={achRoutingNumber} onChange={(e) => setAchRoutingNumber(e.target.value)} maxLength={9} />
            </div>
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input placeholder="Account number" value={achAccountNumber} onChange={(e) => setAchAccountNumber(e.target.value)} />
            </div>
            <Button onClick={handleACHDeposit} disabled={isProcessing} className="w-full banking-button">
              {isProcessing ? "Processing..." : "Initiate ACH Transfer"}
            </Button>
          </TabsContent>

          <TabsContent value="bank" className="space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Wire transfers are typically processed within 24 hours. Fees may apply.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Sending Bank Name</Label>
              <Input placeholder="Bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Routing Number</Label>
              <Input placeholder="9-digit routing number" value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value)} maxLength={9} />
            </div>
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input placeholder="Account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            </div>
            <Button onClick={handleBankTransfer} disabled={isProcessing} className="w-full banking-button">
              {isProcessing ? "Processing..." : "Submit Wire Transfer"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
