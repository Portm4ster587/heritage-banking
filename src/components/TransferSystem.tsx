import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRightLeft, Send, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedTransferProgress } from "@/components/EnhancedTransferProgress";
import { TransferSuccessScreen } from "@/components/TransferSuccessScreen";
import { AlertSystem } from "@/components/AlertSystem";

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  routing_number: string;
  balance: number | null;
  status: string | null;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
}

interface Transfer {
  id: string;
  from_account_id: string | null;
  to_account_id: string | null;
  amount: number;
  status: string | null;
  description: string | null;
  created_at: string;
  user_id: string;
  transfer_type: string;
}

export const TransferSystem = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [fromAccount, setFromAccount] = useState<string>("");
  const [toAccount, setToAccount] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [showTransferProgress, setShowTransferProgress] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAccounts();
      fetchTransfers();
    }
  }, [user]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active');

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load accounts",
        variant: "destructive"
      });
    }
  };

  const fetchTransfers = async () => {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransfers(data || []);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    }
  };

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
    
    if (!sourceAccount || sourceAccount.balance < transferAmount) {
      toast({
        title: "Insufficient Funds",
        description: "The source account doesn't have enough balance",
        variant: "destructive"
      });
      return;
    }

    setIsTransferring(true);
    setShowTransferProgress(true);

    try {
      const { data, error } = await supabase
        .from('transfers')
        .insert([{ 
          from_account_id: fromAccount,
          to_account_id: toAccount,
          amount: transferAmount,
          description: memo || null,
          user_id: user?.id as string,
          transfer_type: 'internal',
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      // Update account balances
      await supabase
        .from('accounts')
        .update({ balance: sourceAccount.balance - transferAmount })
        .eq('id', fromAccount);

      const targetAccount = accounts.find(acc => acc.id === toAccount);
      if (targetAccount) {
        await supabase
          .from('accounts')
          .update({ balance: targetAccount.balance + transferAmount })
          .eq('id', toAccount);
      }

      // Simulate transfer processing - this will be handled by EnhancedTransferProgress
      setTimeout(() => {
        toast({
          title: "Transfer Initiated",
          description: `Transfer of $${transferAmount} has been started`,
        });
        
        // Reset form
        setFromAccount("");
        setToAccount("");
        setAmount("");
        setMemo("");
      }, 500);

    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "Transfer Failed",
        description: "Failed to process transfer",
        variant: "destructive"
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleTransferComplete = async () => {
    setShowTransferProgress(false);
    setIsTransferring(false);
    
    const fromAcc = accounts.find(a => a.id === fromAccount);
    const toAcc = accounts.find(a => a.id === toAccount);
    
    setSuccessData({
      amount: parseFloat(amount),
      fromAccount: `${fromAcc?.account_type.replace('_', ' ')} - ${fromAcc?.account_number?.slice(-4)}`,
      toAccount: `${toAcc?.account_type.replace('_', ' ')} - ${toAcc?.account_number?.slice(-4)}`
    });
    
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setSuccessData(null);
    fetchTransfers();
    fetchAccounts();
    setFromAccount("");
    setToAccount("");
    setAmount("");
    setMemo("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'failed':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatAccountDisplay = (account: Account) => {
    const typeDisplay = account.account_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `${typeDisplay} (...${account.account_number.slice(-4)}) - $${(account.balance ?? 0).toLocaleString()}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {showSuccess && successData && (
        <TransferSuccessScreen
          amount={successData.amount}
          fromAccount={successData.fromAccount}
          toAccount={successData.toAccount}
          onClose={handleSuccessClose}
        />
      )}
      
      {accounts.length === 0 && (
        <AlertSystem
          type="info"
          title="No Accounts Found"
          message="You need accounts before making transfers. Default accounts will be created for you automatically."
        />
      )}
      
      <div className="animate-slide-up">
        <h2 className="text-3xl font-bold text-primary mb-2">Transfer Funds</h2>
        <p className="text-muted-foreground">Transfer money between your Heritage Bank accounts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transfer Form */}
        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowRightLeft className="h-6 w-6 text-primary" />
              <span>New Transfer</span>
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
                <div className="flex items-center space-x-3">
                  <div className="relative w-6 h-6">
                    <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="opacity-30"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={50.27}
                        strokeDashoffset={50.27 - (transferProgress / 100) * 50.27}
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                      {transferProgress}%
                    </div>
                  </div>
                  <span>Processing Transfer...</span>
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Transfer Funds
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Transfers */}
        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-6 w-6 text-secondary" />
              <span>Recent Transfers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transfers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No transfers yet</p>
              ) : (
                transfers.map((transfer) => (
                  <div key={transfer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(transfer.status)}
                      <div>
                        <p className="font-medium">${transfer.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {transfer.description || 'Internal Transfer'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transfer.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(transfer.status)}>
                      {transfer.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Summary */}
      <Card className="banking-card">
        <CardHeader>
          <CardTitle>Your Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div key={account.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">
                    {account.account_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h4>
                  <Badge variant="outline">
                    USD
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  ...{account.account_number.slice(-4)}
                </p>
                <p className="text-xl font-bold text-primary">
                  ${account.balance.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Transfer Progress */}
      <EnhancedTransferProgress
        isVisible={showTransferProgress}
        onComplete={handleTransferComplete}
      />
    </div>
  );
};