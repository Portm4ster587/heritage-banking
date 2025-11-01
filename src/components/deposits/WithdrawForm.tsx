import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpCircle, Bitcoin, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface WithdrawFormProps {
  accounts: Array<{
    id: string;
    account_number: string;
    account_type: string;
    balance: number;
  }>;
  onSuccess?: () => void;
}

export const WithdrawForm = ({ accounts, onSuccess }: WithdrawFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [amount, setAmount] = useState('');
  const [sourceAccount, setSourceAccount] = useState('');
  const [method, setMethod] = useState<'bank' | 'crypto'>('bank');
  const [isProcessing, setIsProcessing] = useState(false);

  // Crypto
  const [cryptoCurrency, setCryptoCurrency] = useState('BTC');
  const [walletAddress, setWalletAddress] = useState('');

  // Bank
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const handleWithdraw = async () => {
    if (!amount || !sourceAccount) {
      toast({ title: 'Missing Information', description: 'Please select an account and amount', variant: 'destructive' });
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Enter a valid amount', variant: 'destructive' });
      return;
    }

    const src = accounts.find((a) => a.id === sourceAccount);
    if (!src) return;
    if ((src.balance ?? 0) < withdrawAmount) {
      toast({ title: 'Insufficient Funds', description: 'Source account balance is too low', variant: 'destructive' });
      return;
    }

    if (method === 'bank' && (!bankName || !routingNumber || !accountNumber)) {
      toast({ title: 'Missing Bank Details', description: 'Provide bank details', variant: 'destructive' });
      return;
    }

    if (method === 'crypto' && (!cryptoCurrency || !walletAddress)) {
      toast({ title: 'Missing Crypto Details', description: 'Provide crypto and wallet address', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);

    try {
      // Create withdraw request
      const { data: wr, error } = await supabase
        .from('withdraw_requests')
        .insert([
          {
            user_id: user?.id,
            account_id: sourceAccount,
            amount: withdrawAmount,
            method,
            destination:
              method === 'crypto'
                ? `${cryptoCurrency}:${walletAddress}`
                : `BANK:${bankName}|ROUT:${routingNumber}|ACC:${accountNumber}`,
            status: 'pending',
            reference_number: `WD-${Date.now()}`,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Auto-complete for demo: debit account and mark completed
      setTimeout(async () => {
        const { error: updateError } = await supabase
          .from('accounts')
          .update({ balance: (src.balance ?? 0) - withdrawAmount })
          .eq('id', sourceAccount);
        if (updateError) throw updateError;

        await supabase
          .from('withdraw_requests')
          .update({ status: 'completed', processed_at: new Date().toISOString() })
          .eq('id', wr.id);

        toast({ title: 'Withdrawal Successful', description: `$${withdrawAmount.toLocaleString()} withdrawn successfully` });
        setAmount('');
        setSourceAccount('');
        setWalletAddress('');
        setBankName('');
        setRoutingNumber('');
        setAccountNumber('');
        onSuccess?.();
      }, 2000);

      toast({ title: 'Withdrawal Processing', description: 'Your withdrawal is being processed...' });
    } catch (err) {
      console.error('Withdraw error:', err);
      toast({ title: 'Withdrawal Failed', description: 'Could not process withdrawal', variant: 'destructive' });
    } finally {
      setTimeout(() => setIsProcessing(false), 2500);
    }
  };

  return (
    <Card className="banking-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpCircle className="w-5 h-5 text-primary" />
          Withdraw Funds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} min="1" step="0.01" />
        </div>

        <div className="space-y-2">
          <Label>From Account</Label>
          <Select value={sourceAccount} onValueChange={setSourceAccount}>
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.account_type.replace('_', ' ')} (...{a.account_number.slice(-4)}) - ${ (a.balance ?? 0).toLocaleString() }
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Method</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant={method === 'bank' ? 'default' : 'outline'} onClick={() => setMethod('bank')} className="flex-col h-auto py-4">
              <Building2 className="w-6 h-6 mb-2" />
              <span className="text-xs">Bank</span>
            </Button>
            <Button type="button" variant={method === 'crypto' ? 'default' : 'outline'} onClick={() => setMethod('crypto')} className="flex-col h-auto py-4">
              <Bitcoin className="w-6 h-6 mb-2" />
              <span className="text-xs">Crypto</span>
            </Button>
          </div>
        </div>

        {method === 'bank' && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label>Bank Name</Label>
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
          </div>
        )}

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
              <Label>Wallet Address</Label>
              <Input placeholder="Destination wallet address" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} />
            </div>
          </div>
        )}

        <Button onClick={handleWithdraw} disabled={isProcessing} className="w-full banking-button">
          {isProcessing ? 'Processing Withdrawal...' : 'Withdraw'} {amount && !isProcessing ? `$${amount}` : ''}
        </Button>
      </CardContent>
    </Card>
  );
}
