import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DollarSign, Edit, Plus, Minus, RefreshCw, Search, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserAccount {
  id: string;
  user_id: string;
  account_number: string;
  account_type: string;
  balance: number;
  status: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export const AdminBalanceEditor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentNote, setAdjustmentNote] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      // Fetch accounts with user profiles
      const { data: accountsData, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unique user IDs and fetch their profiles
      const userIds = [...new Set(accountsData?.map(a => a.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', userIds);

      // Get user emails from auth metadata (not directly accessible, so we'll use profile data)
      const accountsWithInfo = (accountsData || []).map(account => {
        const profile = profiles?.find(p => p.user_id === account.user_id);
        return {
          ...account,
          first_name: profile?.first_name,
          last_name: profile?.last_name,
        };
      });

      setAccounts(accountsWithInfo);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({ title: 'Error', description: 'Failed to load accounts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedAccount || !adjustmentAmount) {
      toast({ title: 'Missing Information', description: 'Please enter an amount', variant: 'destructive' });
      return;
    }

    const amount = parseFloat(adjustmentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid positive amount', variant: 'destructive' });
      return;
    }

    let newBalance = selectedAccount.balance;
    if (adjustmentType === 'add') {
      newBalance += amount;
    } else if (adjustmentType === 'subtract') {
      newBalance -= amount;
      if (newBalance < 0) {
        toast({ title: 'Invalid Operation', description: 'Balance cannot go negative', variant: 'destructive' });
        return;
      }
    } else if (adjustmentType === 'set') {
      newBalance = amount;
    }

    try {
      // Update account balance
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', selectedAccount.id);

      if (updateError) throw updateError;

      // Log the adjustment as a transfer
      await supabase.from('transfers').insert({
        user_id: selectedAccount.user_id,
        amount: amount,
        transfer_type: adjustmentType === 'subtract' ? 'admin_debit' : 'admin_credit',
        status: 'completed',
        description: `Admin balance adjustment (${adjustmentType}): ${adjustmentNote || 'No note provided'}`,
        to_account_id: adjustmentType !== 'subtract' ? selectedAccount.id : null,
        from_account_id: adjustmentType === 'subtract' ? selectedAccount.id : null,
        approved_by_admin_id: user?.id,
        completed_at: new Date().toISOString()
      });

      // Create notification for user
      await supabase.from('user_notifications').insert({
        user_id: selectedAccount.user_id,
        type: 'transaction',
        title: 'Account Balance Updated',
        message: `Your ${formatAccountType(selectedAccount.account_type)} account balance has been updated to $${newBalance.toLocaleString()}.`,
        priority: 'high'
      });

      toast({
        title: 'Balance Updated',
        description: `New balance: $${newBalance.toLocaleString()}`,
      });

      setIsDialogOpen(false);
      setSelectedAccount(null);
      setAdjustmentAmount('');
      setAdjustmentNote('');
      fetchAccounts();
    } catch (error) {
      console.error('Error adjusting balance:', error);
      toast({ title: 'Error', description: 'Failed to update balance', variant: 'destructive' });
    }
  };

  const formatAccountType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredAccounts = accounts.filter(account => {
    const searchLower = searchTerm.toLowerCase();
    return (
      account.account_number.toLowerCase().includes(searchLower) ||
      account.account_type.toLowerCase().includes(searchLower) ||
      (account.first_name?.toLowerCase() || '').includes(searchLower) ||
      (account.last_name?.toLowerCase() || '').includes(searchLower)
    );
  });

  const getUserDisplayName = (account: UserAccount) => {
    if (account.first_name && account.last_name) {
      return `${account.first_name} ${account.last_name}`;
    }
    return `User ${account.user_id.slice(0, 8)}`;
  };

  return (
    <Card className="banking-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Balance Editor
          </div>
          <Button variant="outline" size="sm" onClick={fetchAccounts} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, account number, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Accounts Table */}
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Loading accounts...</p>
                  </TableCell>
                </TableRow>
              ) : filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No accounts found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      {getUserDisplayName(account)}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        ...{account.account_number.slice(-6)}
                      </code>
                    </TableCell>
                    <TableCell>
                      {formatAccountType(account.account_type)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ${account.balance.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                        {account.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAccount(account);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit Balance Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Account Balance</DialogTitle>
            </DialogHeader>
            {selectedAccount && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">{getUserDisplayName(selectedAccount)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatAccountType(selectedAccount.account_type)} - ...{selectedAccount.account_number.slice(-4)}
                  </p>
                  <p className="text-2xl font-bold text-primary mt-2">
                    Current: ${selectedAccount.balance.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Adjustment Type</Label>
                  <Select value={adjustmentType} onValueChange={(v) => setAdjustmentType(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4 text-green-500" />
                          Add to Balance
                        </div>
                      </SelectItem>
                      <SelectItem value="subtract">
                        <div className="flex items-center gap-2">
                          <Minus className="w-4 h-4 text-red-500" />
                          Subtract from Balance
                        </div>
                      </SelectItem>
                      <SelectItem value="set">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-blue-500" />
                          Set Exact Balance
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  {adjustmentAmount && (
                    <p className="text-sm text-muted-foreground">
                      New balance will be: $
                      {(() => {
                        const amt = parseFloat(adjustmentAmount) || 0;
                        if (adjustmentType === 'add') return (selectedAccount.balance + amt).toLocaleString();
                        if (adjustmentType === 'subtract') return Math.max(0, selectedAccount.balance - amt).toLocaleString();
                        return amt.toLocaleString();
                      })()}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Admin Note</Label>
                  <Textarea
                    placeholder="Reason for adjustment (required for audit)"
                    value={adjustmentNote}
                    onChange={(e) => setAdjustmentNote(e.target.value)}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdjustBalance} disabled={!adjustmentAmount || !adjustmentNote}>
                Update Balance
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
