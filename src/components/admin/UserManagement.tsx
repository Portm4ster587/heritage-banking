import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Users, Eye, Edit, Ban, CheckCircle, Lock, Unlock, DollarSign, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  accounts: Array<{
    id: string;
    account_type: string;
    balance: number;
    status: string;
  }>;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState<'hold' | 'freeze' | 'adjust' | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch all accounts with user info
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (accountsError) throw accountsError;

      // Group accounts by user
      const usersMap = new Map<string, UserData>();
      
      for (const account of accountsData || []) {
        if (!usersMap.has(account.user_id)) {
          usersMap.set(account.user_id, {
            id: account.user_id,
            email: '', // Will be filled if needed
            created_at: account.created_at || '',
            accounts: []
          });
        }
        
        const userData = usersMap.get(account.user_id)!;
        userData.accounts.push({
          id: account.id,
          account_type: account.account_type,
          balance: account.balance ?? 0,
          status: account.status || 'unknown'
        });
      }

      setUsers(Array.from(usersMap.values()));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.includes(searchTerm)
  );

  const getTotalBalance = (accounts: UserData['accounts']) => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  };

  const handleAccountAction = async (accountId: string, action: 'hold' | 'active' | 'frozen') => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ status: action })
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Account Updated",
        description: `Account status changed to ${action}`,
      });

      fetchUsers();
      setActionDialog(null);
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: "Error",
        description: "Failed to update account status",
        variant: "destructive"
      });
    }
  };

  const handleBalanceAdjustment = async () => {
    if (!selectedAccount || !adjustAmount) return;

    try {
      const adjustment = parseFloat(adjustAmount);
      const newBalance = selectedAccount.balance + adjustment;

      const { error } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', selectedAccount.id);

      if (error) throw error;

      toast({
        title: "Balance Adjusted",
        description: `Balance ${adjustment > 0 ? 'increased' : 'decreased'} by $${Math.abs(adjustment).toLocaleString()}`,
      });

      fetchUsers();
      setActionDialog(null);
      setAdjustAmount('');
      setAdjustNote('');
    } catch (error) {
      console.error('Error adjusting balance:', error);
      toast({
        title: "Error",
        description: "Failed to adjust balance",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription>View and manage all bank users</CardDescription>
            </div>
            <Button onClick={fetchUsers} variant="outline">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading users...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Accounts</TableHead>
                    <TableHead>Total Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-mono text-xs">{user.id.slice(0, 8)}...</p>
                          {user.email && (
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {user.accounts.map((acc) => (
                            <Badge key={acc.id} variant="outline" className="text-xs">
                              {acc.account_type.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          ${getTotalBalance(user.accounts).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          user.accounts.some(a => a.status === 'active') ? 'default' : 'secondary'
                        }>
                          {user.accounts.some(a => a.status === 'active') ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {user.accounts.map((acc) => (
                            <div key={acc.id} className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setSelectedAccount(acc);
                                  setActionDialog('adjust');
                                }}
                                title="Adjust Balance"
                              >
                                <DollarSign className="w-4 h-4" />
                              </Button>
                              <Select
                                value={acc.status}
                                onValueChange={(value) => handleAccountAction(acc.id, value as any)}
                              >
                                <SelectTrigger className="h-8 w-[100px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="hold">Hold</SelectItem>
                                  <SelectItem value="frozen">Frozen</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balance Adjustment Dialog */}
      <Dialog open={actionDialog === 'adjust'} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Account Balance</DialogTitle>
            <DialogDescription>
              Current Balance: ${selectedAccount?.balance?.toLocaleString() || '0'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Adjustment Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="Enter amount (positive to add, negative to deduct)"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                placeholder="Reason for adjustment"
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
              />
            </div>
            {adjustAmount && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">
                  New Balance: ${(selectedAccount?.balance + parseFloat(adjustAmount || '0')).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleBalanceAdjustment} disabled={!adjustAmount}>
              Apply Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};