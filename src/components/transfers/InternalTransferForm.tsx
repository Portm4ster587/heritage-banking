import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRightLeft, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TransferHIHProgress } from '@/components/TransferHIHProgress';
import { TransferSuccessScreen } from '@/components/TransferSuccessScreen';

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
  routing_number?: string;
}

interface InternalTransferFormProps {
  accounts: Account[];
  onSuccess?: () => void;
}

export const InternalTransferForm = ({ accounts, onSuccess }: InternalTransferFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transferData, setTransferData] = useState<{
    amount: number;
    fromAccount: Account | null;
    toAccount: Account | null;
    transactionId: string;
  } | null>(null);

  const handleTransfer = async () => {
    if (!fromAccount || !toAccount || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (fromAccount === toAccount) {
      toast({
        title: "Invalid Transfer",
        description: "Cannot transfer to the same account",
        variant: "destructive"
      });
      return;
    }

    const transferAmount = parseFloat(amount);
    const sourceAccount = accounts.find(acc => acc.id === fromAccount);
    const targetAccount = accounts.find(acc => acc.id === toAccount);
    
    if (!sourceAccount || (sourceAccount.balance ?? 0) < transferAmount) {
      toast({
        title: "Insufficient Funds",
        description: "The source account doesn't have enough balance",
        variant: "destructive"
      });
      return;
    }

    setIsTransferring(true);
    setShowProgress(true);
  };

  const handleProgressComplete = async () => {
    const transferAmount = parseFloat(amount);
    const sourceAccount = accounts.find(acc => acc.id === fromAccount);
    const targetAccount = accounts.find(acc => acc.id === toAccount);

    try {
      const transactionId = `HBT${Date.now().toString(36).toUpperCase()}`;

      // Create transfer record
      const { error: transferError } = await supabase
        .from('transfers')
        .insert([{ 
          from_account_id: fromAccount,
          to_account_id: toAccount,
          amount: transferAmount,
          description: memo || 'Internal Transfer',
          user_id: user?.id as string,
          transfer_type: 'internal',
          status: 'completed',
          completed_at: new Date().toISOString()
        }]);

      if (transferError) throw transferError;

      // Update account balances
      await supabase
        .from('accounts')
        .update({ balance: (sourceAccount?.balance ?? 0) - transferAmount })
        .eq('id', fromAccount);

      if (targetAccount) {
        await supabase
          .from('accounts')
          .update({ balance: (targetAccount.balance ?? 0) + transferAmount })
          .eq('id', toAccount);
      }

      setTransferData({
        amount: transferAmount,
        fromAccount: sourceAccount || null,
        toAccount: targetAccount || null,
        transactionId
      });

      // Send email notification
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser?.email) {
          await supabase.functions.invoke('send-notification-email', {
            body: {
              to: currentUser.email,
              subject: `Transfer Completed - $${transferAmount.toLocaleString()}`,
              type: 'transfer',
              data: {
                amount: transferAmount,
                recipientName: formatAccountType(targetAccount?.account_type || 'Account'),
                transactionId,
                status: 'completed'
              }
            }
          });
        }
      } catch (emailError) {
        console.log('Email notification failed:', emailError);
      }

      setShowProgress(false);
      setShowSuccess(true);
      
      onSuccess?.();

    } catch (error) {
      console.error('Transfer error:', error);
      setShowProgress(false);
      toast({
        title: "Transfer Failed",
        description: "Failed to process transfer",
        variant: "destructive"
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setTransferData(null);
    // Reset form
    setFromAccount('');
    setToAccount('');
    setAmount('');
    setMemo('');
  };

  const formatAccountType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatAccountDisplay = (account: Account) => {
    const typeDisplay = formatAccountType(account.account_type);
    return `${typeDisplay} (...${account.account_number.slice(-4)}) - $${(account.balance ?? 0).toLocaleString()}`;
  };

  return (
    <>
      <Card className="banking-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowRightLeft className="h-6 w-6 text-primary" />
            <span>Internal Transfer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="from-account">From Account</Label>
            <Select value={fromAccount} onValueChange={setFromAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Select source account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {formatAccountDisplay(account)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to-account">To Account</Label>
            <Select value={toAccount} onValueChange={setToAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {formatAccountDisplay(account)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">Memo (Optional)</Label>
            <Textarea
              id="memo"
              placeholder="Add a note for this transfer..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleTransfer}
            disabled={isTransferring || !fromAccount || !toAccount || !amount}
            className="w-full banking-button"
          >
            {isTransferring ? (
              'Processing...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Transfer Funds
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Transfer Progress Animation with HIH Logo */}
      <TransferHIHProgress 
        isVisible={showProgress} 
        onComplete={handleProgressComplete}
      />

      {/* Transfer Success Screen */}
      {showSuccess && transferData && (
        <TransferSuccessScreen
          amount={transferData.amount}
          fromAccount={formatAccountType(transferData.fromAccount?.account_type || '')}
          toAccount={formatAccountType(transferData.toAccount?.account_type || '')}
          fromAccountNumber={transferData.fromAccount?.account_number}
          fromRoutingNumber={transferData.fromAccount?.routing_number}
          toAccountNumber={transferData.toAccount?.account_number}
          toRoutingNumber={transferData.toAccount?.routing_number}
          transactionId={transferData.transactionId}
          onClose={handleSuccessClose}
        />
      )}
    </>
  );
};
