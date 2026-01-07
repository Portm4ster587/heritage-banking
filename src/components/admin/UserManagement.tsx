import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users, DollarSign, RefreshCw, Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  created_at: string;
}

interface Account {
  id: string;
  user_id: string;
  account_number: string;
  account_type: string;
  balance: number;
  status: string | null;
  routing_number: string;
  created_at: string;
}

interface UserWithAccounts {
  profile: UserProfile;
  accounts: Account[];
  totalBalance: number;
}

export const UserManagement = () => {
  const [usersWithAccounts, setUsersWithAccounts] = useState<UserWithAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithAccounts | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [actionDialog, setActionDialog] = useState<'adjust' | 'view' | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsersWithAccounts();
  }, []);

  const fetchUsersWithAccounts = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (accountsError) throw accountsError;

      // Group accounts by user_id and combine with profiles
      const usersMap = new Map<string, UserWithAccounts>();

      // First, add all profiles
      for (const profile of profiles || []) {
        usersMap.set(profile.user_id, {
          profile,
          accounts: [],
          totalBalance: 0
        });
      }

      // Then, add accounts to their respective users
      for (const account of accounts || []) {
        const user = usersMap.get(account.user_id);
        if (user) {
          user.accounts.push(account);
          user.totalBalance += account.balance || 0;
        } else {
          // Create a placeholder user for accounts without profiles
          usersMap.set(account.user_id, {
            profile: {
              id: account.user_id,
              user_id: account.user_id,
              first_name: null,
              last_name: null,
              username: null,
              phone: null,
              address: null,
              city: null,
              state: null,
              zip_code: null,
              created_at: account.created_at || ''
            },
            accounts: [account],
            totalBalance: account.balance || 0
          });
        }
      }

      setUsersWithAccounts(Array.from(usersMap.values()));
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

  const filteredUsers = usersWithAccounts.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.toLowerCase();
    const username = user.profile.username?.toLowerCase() || '';
    const userId = user.profile.user_id.toLowerCase();
    
    return fullName.includes(searchLower) || 
           username.includes(searchLower) || 
           userId.includes(searchLower);
  });

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

      fetchUsersWithAccounts();
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
      const newBalance = (selectedAccount.balance || 0) + adjustment;

      const { error } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', selectedAccount.id);

      if (error) throw error;

      toast({
        title: "Balance Adjusted",
        description: `Balance ${adjustment > 0 ? 'increased' : 'decreased'} by $${Math.abs(adjustment).toLocaleString()}`,
      });

      fetchUsersWithAccounts();
      setActionDialog(null);
      setAdjustAmount('');
      setAdjustNote('');
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error adjusting balance:', error);
      toast({
        title: "Error",
        description: "Failed to adjust balance",
        variant: "destructive"
      });
    }
  };

  const getUserDisplayName = (profile: UserProfile) => {
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    if (profile.username) {
      return profile.username;
    }
    return 'Unknown User';
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="w-5 h-5 text-primary" />
                User Management
              </CardTitle>
              <CardDescription className="text-sm">
                View and manage all {usersWithAccounts.length} bank users
              </CardDescription>
            </div>
            <Button onClick={fetchUsersWithAccounts} variant="outline" size="sm" className="w-full sm:w-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, username, or user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading users...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block rounded-md border overflow-hidden">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Accounts</TableHead>
                        <TableHead>Total Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.profile.user_id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{getUserDisplayName(user.profile)}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {user.profile.user_id.slice(0, 8)}...
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {user.profile.username || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.accounts.length === 0 ? (
                                <span className="text-muted-foreground text-sm">No accounts</span>
                              ) : (
                                user.accounts.map((acc) => (
                                  <Badge key={acc.id} variant="secondary" className="text-xs">
                                    {acc.account_type.replace('_', ' ')}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-primary">
                              ${user.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              user.accounts.some(a => a.status === 'active') ? 'default' : 
                              user.accounts.some(a => a.status === 'frozen') ? 'destructive' : 'secondary'
                            }>
                              {user.accounts.some(a => a.status === 'active') ? 'Active' : 
                               user.accounts.some(a => a.status === 'frozen') ? 'Frozen' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setActionDialog('view');
                                }}
                              >
                                View
                              </Button>
                              {user.accounts.length > 0 && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedAccount(user.accounts[0]);
                                    setActionDialog('adjust');
                                  }}
                                >
                                  <DollarSign className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                <ScrollArea className="h-[500px]">
                  {filteredUsers.map((user) => (
                    <Card key={user.profile.user_id} className="mb-3 overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold">{getUserDisplayName(user.profile)}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              @{user.profile.username || 'N/A'}
                            </p>
                          </div>
                          <Badge variant={
                            user.accounts.some(a => a.status === 'active') ? 'default' : 
                            user.accounts.some(a => a.status === 'frozen') ? 'destructive' : 'secondary'
                          }>
                            {user.accounts.some(a => a.status === 'active') ? 'Active' : 
                             user.accounts.some(a => a.status === 'frozen') ? 'Frozen' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <p className="text-muted-foreground text-xs">Accounts</p>
                            <p className="font-medium">{user.accounts.length}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Total Balance</p>
                            <p className="font-semibold text-primary">
                              ${user.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {user.accounts.map((acc) => (
                            <Badge key={acc.id} variant="secondary" className="text-xs">
                              {acc.account_type.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setSelectedUser(user);
                              setActionDialog('view');
                            }}
                          >
                            View Details
                          </Button>
                          {user.accounts.length > 0 && (
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => {
                                setSelectedAccount(user.accounts[0]);
                                setActionDialog('adjust');
                              }}
                            >
                              <DollarSign className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </ScrollArea>
              </div>
            </>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View User Details Dialog */}
      <Dialog open={actionDialog === 'view'} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              {selectedUser && getUserDisplayName(selectedUser.profile)}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{getUserDisplayName(selectedUser.profile)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Username</Label>
                  <p className="font-mono">{selectedUser.profile.username || 'N/A'}</p>
                </div>
                {selectedUser.profile.phone && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone
                    </Label>
                    <p>{selectedUser.profile.phone}</p>
                  </div>
                )}
                {selectedUser.profile.address && (
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Address
                    </Label>
                    <p>
                      {selectedUser.profile.address}, {selectedUser.profile.city}, {selectedUser.profile.state} {selectedUser.profile.zip_code}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-semibold mb-2 block">Accounts</Label>
                <div className="space-y-2">
                  {selectedUser.accounts.map((acc) => (
                    <div key={acc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-2">
                      <div>
                        <p className="font-medium capitalize">{acc.account_type.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          ****{acc.account_number.slice(-4)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          ${(acc.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        <Select
                          value={acc.status || 'active'}
                          onValueChange={(value) => handleAccountAction(acc.id, value as any)}
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="hold">Hold</SelectItem>
                            <SelectItem value="frozen">Frozen</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setSelectedAccount(acc);
                            setActionDialog('adjust');
                          }}
                        >
                          <DollarSign className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Balance Adjustment Dialog */}
      <Dialog open={actionDialog === 'adjust'} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Account Balance</DialogTitle>
            <DialogDescription>
              Current Balance: ${selectedAccount?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
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
                  New Balance: ${((selectedAccount?.balance || 0) + parseFloat(adjustAmount || '0')).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setActionDialog(null)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleBalanceAdjustment} disabled={!adjustAmount} className="w-full sm:w-auto">
              Apply Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
