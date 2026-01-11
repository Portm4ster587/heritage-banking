import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, ArrowRightLeft, Search, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BankIcon, modernBanks } from './ModernBankIcons';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAccountLookup } from '@/hooks/useAccountLookup';
import { useSmsNotification } from '@/hooks/useSmsNotification';

interface ExternalAccount {
  id: string;
  bank_name: string;
  account_number: string;
  routing_number: string;
  account_type: string;
  account_holder: string;
  is_verified: boolean;
}

interface SourceAccount {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
}

export const ExternalBankTransfer = ({
  accounts,
  onSuccess,
}: {
  accounts: SourceAccount[];
  onSuccess?: () => void;
}) => {
  const { user } = useAuth();
  const [externalAccounts, setExternalAccounts] = useState<ExternalAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    bank_name: '',
    account_number: '',
    routing_number: '',
    account_type: 'checking',
    account_holder: ''
  });
  const [selectedBank, setSelectedBank] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedExternalAccount, setSelectedExternalAccount] = useState('');
  const [sourceAccount, setSourceAccount] = useState('');
  const { toast } = useToast();
  const { lookupAccount, loading: lookupLoading, result: lookupResult, clearResult } = useAccountLookup();
  const { sendTransactionAlert } = useSmsNotification();
  const [userPhone, setUserPhone] = useState<string | null>(null);

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

  const handleAddExternalAccount = () => {
    if (!newAccount.bank_name || !newAccount.account_number || !newAccount.routing_number || !newAccount.account_holder) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const account: ExternalAccount = {
      id: Math.random().toString(),
      ...newAccount,
      is_verified: false,
    };

    setExternalAccounts([...externalAccounts, account]);
    setNewAccount({
      bank_name: '',
      account_number: '',
      routing_number: '',
      account_type: 'checking',
      account_holder: '',
    });
    setShowAddForm(false);
    setSelectedBank('');

    toast({
      title: 'External Account Added',
      description: 'Your external bank account has been added for verification',
    });
  };

  const handleExternalTransfer = async () => {
    if (!sourceAccount || !selectedExternalAccount || !transferAmount) {
      toast({
        title: 'Missing Information',
        description: 'Please select a source account, destination and enter amount',
        variant: 'destructive',
      });
      return;
    }

    const amt = parseFloat(transferAmount);
    if (amt <= 0) {
      toast({ title: 'Invalid amount', description: 'Enter a positive amount', variant: 'destructive' });
      return;
    }

    const src = accounts.find((a) => a.id === sourceAccount);
    if (!src) return;
    if ((src.balance ?? 0) < amt) {
      toast({ title: 'Insufficient Funds', description: 'Source account balance is too low', variant: 'destructive' });
      return;
    }

    const ext = externalAccounts.find((e) => e.id === selectedExternalAccount);

    try {
      // Record transfer
      const { error: transferError } = await supabase.from('transfers').insert([
        {
          from_account_id: sourceAccount,
          to_account_id: null,
          amount: amt,
          description: `External transfer to ${ext?.bank_name || 'external bank'}`,
          user_id: user?.id as string,
          transfer_type: 'external',
          status: 'pending',
        },
      ]);
      if (transferError) throw transferError;

      // Debit immediately for demo purposes
      const { error: debitError } = await supabase
        .from('accounts')
        .update({ balance: (src.balance ?? 0) - amt })
        .eq('id', sourceAccount);
      if (debitError) throw debitError;

      toast({
        title: 'External Transfer Initiated',
        description: `Transfer of $${amt.toLocaleString()} to ${ext?.bank_name || 'external account'} initiated.`,
      });

      // Send email notification
      try {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            to: user?.email,
            subject: 'Heritage Bank - External Transfer Initiated',
            type: 'transfer',
            data: {
              amount: amt,
              recipientName: ext?.bank_name || 'External Bank',
              transactionId: `ACH-${Date.now()}`,
              status: 'pending'
            }
          }
        });
      } catch (emailError) {
        console.log('Email notification failed:', emailError);
      }

      // Send SMS notification if phone available
      if (userPhone) {
        sendTransactionAlert(userPhone, amt, 'debit', `to ${ext?.bank_name || 'external bank'}`);
      }

      setTransferAmount('');
      setSelectedExternalAccount('');
      setSourceAccount('');
      onSuccess?.();
    } catch (err) {
      console.error('External transfer error:', err);
      toast({ title: 'Transfer Failed', description: 'Could not initiate external transfer', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">External Bank Transfers</h2>
          <p className="text-muted-foreground">Transfer funds to and from external US bank accounts</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="banking-button">
          <Plus className="w-4 h-4 mr-2" />
          Add External Account
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer Form */}
        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
              <span>External Transfer</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>From Account</Label>
              <Select value={sourceAccount} onValueChange={setSourceAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose source account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.account_type.replace('_', ' ')} (...{a.account_number.slice(-4)}) - $
                      {(a.balance ?? 0).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Select External Account</Label>
              <Select value={selectedExternalAccount} onValueChange={setSelectedExternalAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose external account" />
                </SelectTrigger>
                <SelectContent>
                  {externalAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.bank_name} - {account.account_type} (...{account.account_number.slice(-4)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Transfer Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <Button onClick={handleExternalTransfer} disabled={!sourceAccount || !selectedExternalAccount || !transferAmount} className="w-full banking-button">
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Initiate External Transfer
            </Button>

            <p className="text-xs text-muted-foreground">External transfers typically take 1-3 business days to complete.</p>
          </CardContent>
        </Card>

        {/* External Accounts List */}
        <Card className="banking-card">
          <CardHeader>
            <CardTitle>Linked External Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {externalAccounts.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No external accounts linked</p>
                <Button variant="outline" onClick={() => setShowAddForm(true)} className="mt-4">
                  Add Your First Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {externalAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BankIcon bankName={account.bank_name} className="w-8 h-8" />
                      <div>
                        <p className="font-medium">{account.bank_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {account.account_type} (...{account.account_number.slice(-4)})
                        </p>
                        <p className="text-sm text-muted-foreground">{account.account_holder}</p>
                      </div>
                    </div>
                    <Badge variant={account.is_verified ? 'default' : 'secondary'}>
                      {account.is_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Account Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md animate-scale-in">
            <CardHeader>
              <CardTitle>Add External Bank Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Bank</Label>
                <Select
                  value={selectedBank}
                  onValueChange={(value) => {
                    setSelectedBank(value);
                    const bank = modernBanks.find((b) => b.code === value);
                    if (bank) {
                      setNewAccount((prev) => ({ ...prev, bank_name: bank.name }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {modernBanks.map((bank) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        <div className="flex items-center space-x-3">
                          <BankIcon bankName={bank.name} className="w-5 h-5" />
                          <span className="font-medium">{bank.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Account Holder Name</Label>
                <Input
                  value={newAccount.account_holder}
                  onChange={(e) => setNewAccount((prev) => ({ ...prev, account_holder: e.target.value }))}
                  placeholder="Full name as it appears on account"
                />
              </div>

              <div>
                <Label>Account Number</Label>
                <div className="flex gap-2">
                  <Input
                    value={newAccount.account_number}
                    onChange={(e) => {
                      setNewAccount((prev) => ({ ...prev, account_number: e.target.value }));
                      clearResult();
                    }}
                    placeholder="Account number"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => lookupAccount(newAccount.account_number, newAccount.routing_number)}
                    disabled={!newAccount.account_number || lookupLoading}
                  >
                    {lookupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
                {lookupResult && (
                  <div className={`mt-2 p-2 rounded-md text-sm flex items-center gap-2 ${lookupResult.found ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                    {lookupResult.found ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Account: <strong>{lookupResult.accountName}</strong> at {lookupResult.bankName}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        <span>{lookupResult.message}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label>Routing Number</Label>
                <Input
                  value={newAccount.routing_number}
                  onChange={(e) => setNewAccount((prev) => ({ ...prev, routing_number: e.target.value }))}
                  placeholder="9-digit routing number"
                />
              </div>

              <div>
                <Label>Account Type</Label>
                <Select value={newAccount.account_type} onValueChange={(value) => setNewAccount((prev) => ({ ...prev, account_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddExternalAccount} className="flex-1 banking-button">
                  Add Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};