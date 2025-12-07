import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightLeft, Send, Clock, CheckCircle, AlertCircle, Eye, EyeOff, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedTransferProgress } from "@/components/EnhancedTransferProgress";
import { TransferSuccessScreen } from "@/components/TransferSuccessScreen";
import { AlertSystem } from "@/components/AlertSystem";
import { ExternalBankTransfer } from "@/components/ExternalBankTransfer";

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
  const [showAccountNumbers, setShowAccountNumbers] = useState(false);
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
    
    if (!sourceAccount || (sourceAccount.balance ?? 0) < transferAmount) {
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
        .update({ balance: (sourceAccount.balance ?? 0) - transferAmount })
        .eq('id', fromAccount);

      const targetAccount = accounts.find(acc => acc.id === toAccount);
      if (targetAccount) {
        await supabase
          .from('accounts')
          .update({ balance: (targetAccount.balance ?? 0) + transferAmount })
          .eq('id', toAccount);
      }

    } catch (error) {
      console.error('Transfer error:', error);
      setShowTransferProgress(false);
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
    
    const fromDisplay = fromAcc 
      ? `${formatAccountType(fromAcc.account_type)} ending in ${fromAcc.account_number.slice(-4)}`
      : 'Unknown';
    const toDisplay = toAcc 
      ? `${formatAccountType(toAcc.account_type)} ending in ${toAcc.account_number.slice(-4)}`
      : 'Unknown';
    
    setSuccessData({
      amount: parseFloat(amount),
      fromAccount: fromDisplay,
      toAccount: toDisplay
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

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAccountType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatAccountDisplay = (account: Account) => {
    const typeDisplay = formatAccountType(account.account_type);
    const accountNum = showAccountNumbers 
      ? account.account_number 
      : `****${account.account_number.slice(-4)}`;
    return `${typeDisplay} (${accountNum}) - $${(account.balance ?? 0).toLocaleString()}`;
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
        <p className="text-muted-foreground">Transfer money between your accounts or to external banks</p>
      </div>

      <Tabs defaultValue="internal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="internal" className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" />
            Heritage Transfers
          </TabsTrigger>
          <TabsTrigger value="external" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            External Banks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Transfer Form */}
            <Card className="banking-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <ArrowRightLeft className="h-6 w-6 text-primary" />
                    <span>New Transfer</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAccountNumbers(!showAccountNumbers)}
                    className="text-muted-foreground"
                  >
                    {showAccountNumbers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="ml-2 text-xs">{showAccountNumbers ? 'Hide' : 'Show'} Numbers</span>
                  </Button>
                </div>
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
                  className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#0d1b2a] hover:from-[#0d1b2a] hover:to-[#1e3a5f] text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Transfer Funds
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
          <Card className="banking-card mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Accounts</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAccountNumbers(!showAccountNumbers)}
                >
                  {showAccountNumbers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account) => (
                  <div key={account.id} className="p-4 bg-gradient-to-br from-[#1e3a5f] to-[#0d1b2a] rounded-lg text-white">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-heritage-gold">
                        {formatAccountType(account.account_type)}
                      </h4>
                      <Badge className="bg-heritage-gold/20 text-heritage-gold border-heritage-gold/30">
                        USD
                      </Badge>
                    </div>
                    <p className="text-sm text-white/70 mb-1">
                      {showAccountNumbers 
                        ? account.account_number 
                        : `****${account.account_number.slice(-4)}`
                      }
                    </p>
                    <p className="text-2xl font-bold">
                      ${(account.balance ?? 0).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="external">
          <ExternalBankTransfer accounts={accounts} onSuccess={fetchAccounts} />
        </TabsContent>
      </Tabs>

      {/* Enhanced Transfer Progress */}
      <EnhancedTransferProgress
        isVisible={showTransferProgress}
        onComplete={handleTransferComplete}
      />
    </div>
  );
};
