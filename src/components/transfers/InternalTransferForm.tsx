import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, Send, User, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TransferHIHProgress } from '@/components/TransferHIHProgress';
import { TransferSuccessScreen } from '@/components/TransferSuccessScreen';
import { useSmsNotification } from '@/hooks/useSmsNotification';
import { useAccountLookup } from '@/hooks/useAccountLookup';

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
  const { sendTransactionAlert } = useSmsNotification();
  const { lookupAccount, loading: lookupLoading, result: lookupResult, clearResult } = useAccountLookup();
  
  const [fromAccount, setFromAccount] = useState('');
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [externalAccountNumber, setExternalAccountNumber] = useState('');
  const [recipientVerified, setRecipientVerified] = useState(false);
  const [transferMode, setTransferMode] = useState<'internal' | 'heritage'>('internal');

  // Fetch user phone for SMS alerts
  useEffect(() => {
    const fetchPhone = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('profiles')
        .select('phone')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data?.phone) setUserPhone(data.phone);
    };
    fetchPhone();
  }, [user?.id]);

  // Auto-lookup recipient when external account number changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (externalAccountNumber.length >= 8 && transferMode === 'heritage') {
        handleAccountLookup();
      } else {
        clearResult();
        setRecipientVerified(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [externalAccountNumber, transferMode]);

  const handleAccountLookup = async () => {
    if (!externalAccountNumber) return;
    const result = await lookupAccount(externalAccountNumber);
    if (result?.found) {
      setRecipientVerified(true);
    } else {
      setRecipientVerified(false);
    }
  };

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
    // Validate based on transfer mode
    if (transferMode === 'heritage') {
      if (!fromAccount || !externalAccountNumber || !amount) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      if (!recipientVerified || !lookupResult?.found) {
        toast({
          title: "Recipient Not Verified",
          description: "Please enter a valid Heritage account number",
          variant: "destructive"
        });
        return;
      }
    } else {
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
    }

    const transferAmount = parseFloat(amount);
    const sourceAccount = accounts.find(acc => acc.id === fromAccount);
    
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

    try {
      const transactionId = `HBT${Date.now().toString(36).toUpperCase()}`;

      // Determine the target account based on transfer mode
      let targetAccount = transferMode === 'internal' 
        ? accounts.find(acc => acc.id === toAccount)
        : null;
      
      let recipientAccountId = toAccount;
      let recipientName = '';

      // For Heritage member transfers, look up the recipient's account
      if (transferMode === 'heritage' && externalAccountNumber && lookupResult?.found) {
        // Look up recipient account by account number
        const { data: recipientAcc, error: lookupError } = await supabase
          .from('accounts')
          .select('id, account_number, balance, user_id, account_type')
          .eq('account_number', externalAccountNumber)
          .eq('status', 'active')
          .maybeSingle();

        if (lookupError || !recipientAcc) {
          throw new Error('Recipient account not found');
        }

        recipientAccountId = recipientAcc.id;
        recipientName = lookupResult.accountName || 'Heritage Member';
        
        // Create transfer record with recipient info
        const { error: transferError } = await supabase
          .from('transfers')
          .insert([{ 
            from_account_id: fromAccount,
            to_account_id: recipientAccountId,
            amount: transferAmount,
            description: memo || `Heritage Transfer to ${recipientName}`,
            user_id: user?.id as string,
            transfer_type: 'heritage_internal',
            status: 'completed',
            recipient_name: recipientName,
            recipient_account: externalAccountNumber,
            completed_at: new Date().toISOString()
          }]);

        if (transferError) throw transferError;

        // Update sender's account balance
        await supabase
          .from('accounts')
          .update({ balance: (sourceAccount?.balance ?? 0) - transferAmount })
          .eq('id', fromAccount);

        // Update recipient's account balance (real-time update for recipient)
        await supabase
          .from('accounts')
          .update({ balance: (recipientAcc.balance ?? 0) + transferAmount })
          .eq('id', recipientAccountId);

        // Create notification for recipient
        await supabase
          .from('user_notifications')
          .insert([{
            user_id: recipientAcc.user_id,
            title: 'Money Received',
            message: `You received $${transferAmount.toLocaleString()} from a Heritage member`,
            type: 'transfer',
            priority: 'high',
            related_type: 'transfer',
            related_id: recipientAccountId
          }]);

      } else {
        // Internal transfer between user's own accounts
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
      }

      // Set transfer data for success screen
      const targetDisplay = transferMode === 'heritage' && lookupResult?.found
        ? { account_type: 'heritage_member', account_number: externalAccountNumber, routing_number: '021000021' }
        : targetAccount;

      setTransferData({
        amount: transferAmount,
        fromAccount: sourceAccount || null,
        toAccount: targetDisplay as any,
        transactionId
      });

      // Send email notification
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser?.email) {
          const recipientDisplay = transferMode === 'heritage' && lookupResult?.found 
            ? lookupResult.accountName 
            : formatAccountType(targetAccount?.account_type || 'Account');
          
          await supabase.functions.invoke('send-notification-email', {
            body: {
              to: currentUser.email,
              subject: `Transfer Completed - $${transferAmount.toLocaleString()}`,
              type: 'transfer',
              data: {
                amount: transferAmount,
                recipientName: recipientDisplay,
                transactionId,
                status: 'completed'
              }
            }
          });
        }
      } catch (emailError) {
        console.log('Email notification failed:', emailError);
      }

      // Send SMS notification
      if (userPhone) {
        try {
          const recipientDisplay = transferMode === 'heritage' && lookupResult?.found 
            ? lookupResult.accountName 
            : formatAccountType(targetAccount?.account_type || 'Heritage account');
          await sendTransactionAlert(userPhone, transferAmount, 'debit', `to ${recipientDisplay}`);
        } catch (smsError) {
          console.log('SMS notification failed:', smsError);
        }
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
    setExternalAccountNumber('');
    setRecipientVerified(false);
    clearResult();
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
      <Card className="hightech-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowRightLeft className="h-6 w-6 text-primary" />
            <span>Internal Transfer</span>
            <Badge variant="secondary" className="ml-2">Instant</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Transfer funds between your accounts or to other Heritage members
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Transfer Mode Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button 
              variant={transferMode === 'internal' ? 'default' : 'ghost'}
              size="sm" 
              className={`flex-1 ${transferMode === 'internal' ? 'banking-button' : ''}`}
              onClick={() => setTransferMode('internal')}
            >
              My Accounts
            </Button>
            <Button 
              variant={transferMode === 'heritage' ? 'default' : 'ghost'}
              size="sm" 
              className={`flex-1 ${transferMode === 'heritage' ? 'banking-button' : ''}`}
              onClick={() => setTransferMode('heritage')}
            >
              Other Heritage Member
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="from-account">From Account</Label>
            <Select value={fromAccount} onValueChange={setFromAccount}>
              <SelectTrigger className="h-12">
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

          {transferMode === 'internal' ? (
            <div className="space-y-2">
              <Label htmlFor="to-account">To Account</Label>
              <Select value={toAccount} onValueChange={setToAccount}>
                <SelectTrigger className="h-12">
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
          ) : (
            <div className="space-y-2">
              <Label htmlFor="external-account">Recipient Account Number</Label>
              <div className="relative">
                <Input
                  id="external-account"
                  placeholder="Enter Heritage account number"
                  value={externalAccountNumber}
                  onChange={(e) => setExternalAccountNumber(e.target.value)}
                  className="h-12 pr-10"
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
              
              {/* Account Name Display */}
              {lookupResult && (
                <div className={`p-3 rounded-lg border animate-fade-in ${
                  lookupResult.found 
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' 
                    : 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
                }`}>
                  {lookupResult.found ? (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                        <User className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-700 dark:text-green-400">
                          {lookupResult.accountName}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-500">
                          {lookupResult.bankName} • {lookupResult.accountType}
                          {lookupResult.verified && (
                            <Badge className="ml-2 bg-green-500/20 text-green-600 text-xs">Verified</Badge>
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        {lookupResult.message || 'Account not found. Please verify the account number.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
            disabled={
              isTransferring || 
              !fromAccount || 
              !amount ||
              (transferMode === 'internal' && !toAccount) ||
              (transferMode === 'heritage' && (!externalAccountNumber || !recipientVerified))
            }
            className="w-full banking-button"
          >
            {isTransferring ? (
              'Processing...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {transferMode === 'heritage' ? 'Send to Heritage Member' : 'Transfer Funds'}
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
          toAccount={
            transferMode === 'heritage' && lookupResult?.found
              ? `Heritage Member (${lookupResult.accountName})`
              : formatAccountType(transferData.toAccount?.account_type || '')
          }
          fromAccountNumber={transferData.fromAccount?.account_number}
          fromRoutingNumber={transferData.fromAccount?.routing_number}
          toAccountNumber={transferMode === 'heritage' ? externalAccountNumber : transferData.toAccount?.account_number}
          toRoutingNumber={transferMode === 'heritage' ? '021000021' : transferData.toAccount?.routing_number}
          transactionId={transferData.transactionId}
          onClose={handleSuccessClose}
        />
      )}
    </>
  );
};
