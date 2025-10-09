import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bitcoin, CreditCard, Building2, ArrowDownCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DepositFormProps {
  accounts: Array<{
    id: string;
    account_number: string;
    account_type: string;
    balance: number;
  }>;
  onSuccess?: () => void;
}

export const DepositForm = ({ accounts, onSuccess }: DepositFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [method, setMethod] = useState<'crypto' | 'card' | 'bank'>('crypto');
  const [isProcessing, setIsProcessing] = useState(false);

  // Crypto form fields
  const [cryptoCurrency, setCryptoCurrency] = useState('BTC');
  const [walletAddress, setWalletAddress] = useState('');
  
  // Card form fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Bank form fields
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const handleDeposit = async () => {
    if (!amount || !selectedAccount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const depositAmount = parseFloat(amount);
    if (depositAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    // Validate method-specific fields
    if (method === 'crypto' && (!cryptoCurrency || !walletAddress)) {
      toast({
        title: "Missing Crypto Details",
        description: "Please provide cryptocurrency and wallet address",
        variant: "destructive"
      });
      return;
    }

    if (method === 'card' && (!cardNumber || !expiryDate || !cvv)) {
      toast({
        title: "Missing Card Details",
        description: "Please provide complete card information",
        variant: "destructive"
      });
      return;
    }

    if (method === 'bank' && (!bankName || !routingNumber || !accountNumber)) {
      toast({
        title: "Missing Bank Details",
        description: "Please provide complete bank information",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create deposit request
      const { data: depositData, error: depositError } = await supabase
        .from('deposit_requests')
        .insert([{
          user_id: user?.id,
          account_id: selectedAccount,
          amount: depositAmount,
          method: method,
          status: 'pending',
          reference_number: `DEP-${Date.now()}`,
          notes: method === 'crypto' 
            ? `${cryptoCurrency} from ${walletAddress}`
            : method === 'card'
            ? `Card ending in ${cardNumber.slice(-4)}`
            : `Bank: ${bankName}`
        }])
        .select()
        .single();

      if (depositError) throw depositError;

      // For demo purposes, auto-approve and credit the account
      // In production, admin would manually approve
      setTimeout(async () => {
        // Update account balance
        const account = accounts.find(a => a.id === selectedAccount);
        if (account) {
          const { error: updateError } = await supabase
            .from('accounts')
            .update({ balance: account.balance + depositAmount })
            .eq('id', selectedAccount);

          if (updateError) throw updateError;

          // Mark deposit as completed
          await supabase
            .from('deposit_requests')
            .update({ 
              status: 'completed',
              processed_at: new Date().toISOString()
            })
            .eq('id', depositData.id);

          toast({
            title: "Deposit Successful!",
            description: `$${depositAmount.toLocaleString()} has been added to your account`,
          });

          // Reset form
          setAmount('');
          setSelectedAccount('');
          setWalletAddress('');
          setCardNumber('');
          setExpiryDate('');
          setCvv('');
          setBankName('');
          setRoutingNumber('');
          setAccountNumber('');
          
          onSuccess?.();
        }
      }, 2000);

      toast({
        title: "Deposit Processing",
        description: "Your deposit is being processed...",
      });

    } catch (error) {
      console.error('Deposit error:', error);
      toast({
        title: "Deposit Failed",
        description: "Failed to process deposit request",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => setIsProcessing(false), 2500);
    }
  };

  return (
    <Card className="banking-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownCircle className="w-5 h-5 text-primary" />
          Deposit Funds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
                  {account.account_type.replace('_', ' ')} (...{account.account_number.slice(-4)}) - ${account.balance.toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Deposit Method</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={method === 'crypto' ? 'default' : 'outline'}
              onClick={() => setMethod('crypto')}
              className="flex-col h-auto py-4"
            >
              <Bitcoin className="w-6 h-6 mb-2" />
              <span className="text-xs">Crypto</span>
            </Button>
            <Button
              type="button"
              variant={method === 'card' ? 'default' : 'outline'}
              onClick={() => setMethod('card')}
              className="flex-col h-auto py-4"
            >
              <CreditCard className="w-6 h-6 mb-2" />
              <span className="text-xs">Card</span>
            </Button>
            <Button
              type="button"
              variant={method === 'bank' ? 'default' : 'outline'}
              onClick={() => setMethod('bank')}
              className="flex-col h-auto py-4"
            >
              <Building2 className="w-6 h-6 mb-2" />
              <span className="text-xs">Bank</span>
            </Button>
          </div>
        </div>

        {method === 'crypto' && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label>Cryptocurrency</Label>
              <Select value={cryptoCurrency} onValueChange={setCryptoCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="USDT">Tether (USDT)</SelectItem>
                  <SelectItem value="LTC">Litecoin (LTC)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Your Wallet Address</Label>
              <Input
                placeholder="Enter your wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs text-orange-800">
                Crypto deposits are processed instantly. Network fees may apply.
              </p>
            </div>
          </div>
        )}

        {method === 'card' && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label>Card Number</Label>
              <Input
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label>CVV</Label>
                <Input
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={4}
                  type="password"
                />
              </div>
            </div>
          </div>
        )}

        {method === 'bank' && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                placeholder="Your bank name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Routing Number</Label>
              <Input
                placeholder="9-digit routing number"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value)}
                maxLength={9}
              />
            </div>
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                placeholder="Account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
          </div>
        )}

        <Button 
          onClick={handleDeposit}
          disabled={isProcessing}
          className="w-full banking-button"
        >
          {isProcessing ? (
            <>Processing Deposit...</>
          ) : (
            <>
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Deposit ${amount || '0.00'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};