import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Eye,
  Edit,
  AlertTriangle,
  Building,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Ban,
  Unlock,
  Shield,
  Activity,
  TrendingUp,
  Wallet,
  Send,
  History
} from 'lucide-react';

interface UserAccount {
  id: string;
  user_id: string;
  account_number: string;
  account_type: string;
  balance: number;
  status: string;
  routing_number: string;
  created_at: string;
  email?: string;
}

interface Transfer {
  id: string;
  user_id: string;
  amount: number;
  status: string | null;
  transfer_type: string;
  description: string | null;
  recipient_name: string | null;
  recipient_account: string | null;
  from_account_id: string | null;
  to_account_id: string | null;
  created_at: string;
  approved_by_admin_id: string | null;
}

interface Application {
  id: string;
  user_id: string | null;
  application_type: string;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  application_number: string;
  submitted_at: string | null;
  annual_income: number | null;
  initial_deposit_amount: number | null;
  admin_notes: string | null;
}

export const FullAdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    pendingTransfers: 0,
    pendingApplications: 0,
    todayTransactions: 0
  });

  // Dialog states
  const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [balanceAdjustment, setBalanceAdjustment] = useState('');
  const [adjustmentNote, setAdjustmentNote] = useState('');
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
      setupRealtimeSubscriptions();
    }
  }, [isAdmin]);

  const setupRealtimeSubscriptions = () => {
    const transfersChannel = supabase
      .channel('admin-transfers')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transfers' },
        () => {
          fetchTransfers();
          fetchStats();
        }
      )
      .subscribe();

    const accountsChannel = supabase
      .channel('admin-accounts')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'accounts' },
        () => {
          fetchAccounts();
          fetchStats();
        }
      )
      .subscribe();

    const applicationsChannel = supabase
      .channel('admin-applications')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'account_applications' },
        () => fetchApplications()
      )
      .subscribe();

    return () => {
      transfersChannel.unsubscribe();
      accountsChannel.unsubscribe();
      applicationsChannel.unsubscribe();
    };
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchAccounts(),
      fetchTransfers(),
      fetchApplications(),
      fetchStats()
    ]);
    setLoading(false);
  };

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchTransfers = async () => {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      setTransfers(data || []);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('account_applications')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [accountsRes, transfersRes, applicationsRes] = await Promise.all([
        supabase.from('accounts').select('balance, user_id'),
        supabase.from('transfers').select('status, created_at'),
        supabase.from('account_applications').select('status')
      ]);

      const uniqueUsers = new Set(accountsRes.data?.map(a => a.user_id) || []);
      const totalBalance = accountsRes.data?.reduce((sum, a) => sum + (a.balance || 0), 0) || 0;
      const pendingTransfers = transfersRes.data?.filter(t => t.status === 'pending_approval').length || 0;
      const pendingApplications = applicationsRes.data?.filter(a => a.status === 'pending').length || 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTransactions = transfersRes.data?.filter(t => new Date(t.created_at) >= today).length || 0;

      setStats({
        totalUsers: uniqueUsers.size,
        totalBalance,
        pendingTransfers,
        pendingApplications,
        todayTransactions
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Account Management Functions
  const updateAccountStatus = async (accountId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ status })
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Account Updated",
        description: `Account status changed to ${status}`,
      });

      fetchAccounts();
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive"
      });
    }
  };

  const adjustAccountBalance = async () => {
    if (!selectedAccount || !balanceAdjustment) return;

    try {
      const adjustment = parseFloat(balanceAdjustment);
      const newBalance = selectedAccount.balance + adjustment;

      const { error } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', selectedAccount.id);

      if (error) throw error;

      // Log the adjustment as a transfer
      await supabase.from('transfers').insert({
        user_id: selectedAccount.user_id,
        amount: Math.abs(adjustment),
        transfer_type: adjustment > 0 ? 'credit_adjustment' : 'debit_adjustment',
        status: 'completed',
        description: adjustmentNote || `Admin balance adjustment: ${adjustment > 0 ? '+' : ''}${adjustment}`,
        to_account_id: adjustment > 0 ? selectedAccount.id : null,
        from_account_id: adjustment < 0 ? selectedAccount.id : null,
        approved_by_admin_id: user?.id
      });

      toast({
        title: "Balance Adjusted",
        description: `New balance: $${newBalance.toLocaleString()}`,
      });

      fetchAccounts();
      fetchTransfers();
      setSelectedAccount(null);
      setBalanceAdjustment('');
      setAdjustmentNote('');
    } catch (error) {
      console.error('Error adjusting balance:', error);
      toast({
        title: "Error",
        description: "Failed to adjust balance",
        variant: "destructive"
      });
    }
  };

  // Transfer Management Functions
  const approveTransfer = async (transferId: string) => {
    try {
      const transfer = transfers.find(t => t.id === transferId);
      if (!transfer) return;

      // Update transfer status
      const { error: transferError } = await supabase
        .from('transfers')
        .update({ 
          status: 'completed',
          approved_by_admin_id: user?.id,
          completed_at: new Date().toISOString()
        })
        .eq('id', transferId);

      if (transferError) throw transferError;

      // Deduct from source account
      if (transfer.from_account_id) {
        const { data: fromAccount } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', transfer.from_account_id)
          .single();
        
        if (fromAccount) {
          await supabase
            .from('accounts')
            .update({ balance: fromAccount.balance - transfer.amount })
            .eq('id', transfer.from_account_id);
        }
      }

      // Create notification for user
      await supabase.from('user_notifications').insert({
        user_id: transfer.user_id,
        type: 'transfer',
        title: 'Transfer Approved',
        message: `Your transfer of $${transfer.amount.toLocaleString()} has been approved and completed.`,
        priority: 'high'
      });

      toast({
        title: "Transfer Approved",
        description: "Transfer has been completed successfully",
      });

      fetchTransfers();
      fetchAccounts();
      setSelectedTransfer(null);
    } catch (error) {
      console.error('Error approving transfer:', error);
      toast({
        title: "Error",
        description: "Failed to approve transfer",
        variant: "destructive"
      });
    }
  };

  const rejectTransfer = async (transferId: string, reason: string) => {
    try {
      const transfer = transfers.find(t => t.id === transferId);
      if (!transfer) return;

      const { error } = await supabase
        .from('transfers')
        .update({ 
          status: 'rejected',
          description: `${transfer.description || ''} - Rejected: ${reason}`
        })
        .eq('id', transferId);

      if (error) throw error;

      // Notify user
      await supabase.from('user_notifications').insert({
        user_id: transfer.user_id,
        type: 'transfer',
        title: 'Transfer Rejected',
        message: `Your transfer of $${transfer.amount.toLocaleString()} was rejected. Reason: ${reason}`,
        priority: 'high'
      });

      toast({
        title: "Transfer Rejected",
        description: "User has been notified",
      });

      fetchTransfers();
      setSelectedTransfer(null);
      setAdminNote('');
    } catch (error) {
      console.error('Error rejecting transfer:', error);
      toast({
        title: "Error",
        description: "Failed to reject transfer",
        variant: "destructive"
      });
    }
  };

  // Application Management Functions
  const approveApplication = async (applicationId: string) => {
    try {
      const application = applications.find(a => a.id === applicationId);
      if (!application) return;

      // Update application status
      const { error } = await supabase
        .from('account_applications')
        .update({ 
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          approval_date: new Date().toISOString(),
          admin_notes: adminNote || 'Approved by admin'
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Create account for user if user_id exists
      if (application.user_id) {
        const accountNumber = `${application.application_type.toUpperCase().slice(0, 3)}${Date.now()}`;
        
        await supabase.from('accounts').insert({
          user_id: application.user_id,
          account_number: accountNumber,
          account_type: application.application_type,
          routing_number: '021000021',
          balance: application.initial_deposit_amount || 0,
          status: 'active'
        });

        // Notify user
        await supabase.from('user_notifications').insert({
          user_id: application.user_id,
          type: 'application',
          title: 'Application Approved!',
          message: `Your ${application.application_type} application has been approved. Your new account is ready.`,
          priority: 'high'
        });
      }

      toast({
        title: "Application Approved",
        description: "Account has been created for the user",
      });

      fetchApplications();
      fetchAccounts();
      setSelectedApplication(null);
      setAdminNote('');
    } catch (error) {
      console.error('Error approving application:', error);
      toast({
        title: "Error",
        description: "Failed to approve application",
        variant: "destructive"
      });
    }
  };

  const rejectApplication = async (applicationId: string, reason: string) => {
    try {
      const application = applications.find(a => a.id === applicationId);
      if (!application) return;

      const { error } = await supabase
        .from('account_applications')
        .update({ 
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
          admin_notes: adminNote
        })
        .eq('id', applicationId);

      if (error) throw error;

      if (application.user_id) {
        await supabase.from('user_notifications').insert({
          user_id: application.user_id,
          type: 'application',
          title: 'Application Update',
          message: `Your ${application.application_type} application could not be approved. Reason: ${reason}`,
          priority: 'normal'
        });
      }

      toast({
        title: "Application Rejected",
        description: "Applicant has been notified",
      });

      fetchApplications();
      setSelectedApplication(null);
      setAdminNote('');
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive"
      });
    }
  };

  // Filter functions
  const filteredAccounts = accounts.filter(a => 
    a.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.account_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransfers = transfers.filter(t =>
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.transfer_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApplications = applications.filter(a =>
    a.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.application_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingTransfers = transfers.filter(t => t.status === 'pending_approval');

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You don't have admin privileges.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bank Administration</h1>
          <p className="text-muted-foreground">Full banking ecosystem management</p>
        </div>
        <Button onClick={fetchAllData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh All
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wallet className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">${stats.totalBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${stats.pendingTransfers > 0 ? 'from-orange-500/10 to-orange-600/5 border-orange-500/40' : 'from-muted/10 to-muted/5'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Send className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Transfers</p>
                <p className="text-2xl font-bold">{stats.pendingTransfers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${stats.pendingApplications > 0 ? 'from-purple-500/10 to-purple-600/5 border-purple-500/40' : 'from-muted/10 to-muted/5'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Applications</p>
                <p className="text-2xl font-bold">{stats.pendingApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-cyan-500" />
              <div>
                <p className="text-sm text-muted-foreground">Today's Activity</p>
                <p className="text-2xl font-bold">{stats.todayTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search accounts, transfers, applications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">
            Accounts ({accounts.length})
          </TabsTrigger>
          <TabsTrigger value="transfers" className="relative">
            Transfers
            {stats.pendingTransfers > 0 && (
              <Badge className="ml-2 bg-orange-500">{stats.pendingTransfers}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="applications" className="relative">
            Applications
            {stats.pendingApplications > 0 && (
              <Badge className="ml-2 bg-purple-500">{stats.pendingApplications}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pending Approvals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  Pending Transfer Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingTransfers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No pending transfers</p>
                ) : (
                  <div className="space-y-3">
                    {pendingTransfers.slice(0, 5).map(transfer => (
                      <div key={transfer.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">${transfer.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {transfer.transfer_type} • {transfer.recipient_name || 'External'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => approveTransfer(transfer.id)} className="bg-green-500 hover:bg-green-600">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setSelectedTransfer(transfer)}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transfers.slice(0, 5).map(transfer => (
                    <div key={transfer.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {transfer.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : transfer.status === 'rejected' ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium">${transfer.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transfer.created_at), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={transfer.status === 'completed' ? 'default' : 'secondary'}>
                        {transfer.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map(account => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono">{account.account_number}</TableCell>
                      <TableCell className="capitalize">{account.account_type.replace('_', ' ')}</TableCell>
                      <TableCell className="font-mono text-xs">{account.user_id.slice(0, 8)}...</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${account.balance.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={account.status === 'active' ? 'default' : 'destructive'}>
                          {account.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedAccount(account)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {account.status === 'active' ? (
                            <Button size="sm" variant="ghost" onClick={() => updateAccountStatus(account.id, 'frozen')}>
                              <Ban className="w-4 h-4 text-red-500" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => updateAccountStatus(account.id, 'active')}>
                              <Unlock className="w-4 h-4 text-green-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map(transfer => (
                    <TableRow key={transfer.id}>
                      <TableCell>{format(new Date(transfer.created_at), 'MMM dd, HH:mm')}</TableCell>
                      <TableCell className="capitalize">{transfer.transfer_type.replace('_', ' ')}</TableCell>
                      <TableCell>{transfer.recipient_name || 'Internal'}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${transfer.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          transfer.status === 'completed' ? 'default' :
                          transfer.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {transfer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transfer.status === 'pending_approval' && (
                          <div className="flex gap-1">
                            <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => approveTransfer(transfer.id)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setSelectedTransfer(transfer)}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {transfer.status !== 'pending_approval' && (
                          <Button size="sm" variant="ghost" onClick={() => setSelectedTransfer(transfer)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Income</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map(app => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-xs">{app.application_number}</TableCell>
                      <TableCell>{app.first_name} {app.last_name}</TableCell>
                      <TableCell className="capitalize">{app.application_type.replace('_', ' ')}</TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>${(app.annual_income || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          app.status === 'approved' ? 'default' :
                          app.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {app.status === 'pending' ? (
                          <div className="flex gap-1">
                            <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => approveApplication(app.id)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setSelectedApplication(app)}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => setSelectedApplication(app)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Complete Transaction History</CardTitle>
              <CardDescription>All transfers and transactions across the platform</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map(transfer => (
                    <TableRow key={transfer.id}>
                      <TableCell>{format(new Date(transfer.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell className="font-mono text-xs">{transfer.user_id.slice(0, 8)}...</TableCell>
                      <TableCell className="capitalize">{transfer.transfer_type.replace('_', ' ')}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{transfer.description || '-'}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${transfer.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          transfer.status === 'completed' ? 'default' :
                          transfer.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {transfer.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Account Edit Dialog */}
      <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Account</DialogTitle>
            <DialogDescription>
              Account: {selectedAccount?.account_number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAccount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Account Type</Label>
                  <p className="font-medium capitalize">{selectedAccount.account_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label>Current Balance</Label>
                  <p className="font-medium text-lg">${selectedAccount.balance.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Balance Adjustment</Label>
                <Input
                  type="number"
                  placeholder="Enter amount (+/-)"
                  value={balanceAdjustment}
                  onChange={(e) => setBalanceAdjustment(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use positive for credit, negative for debit
                </p>
              </div>

              <div className="space-y-2">
                <Label>Adjustment Note</Label>
                <Textarea
                  placeholder="Reason for adjustment..."
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={adjustAccountBalance} disabled={!balanceAdjustment}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Apply Adjustment
                </Button>
                {selectedAccount.status === 'active' ? (
                  <Button variant="destructive" onClick={() => updateAccountStatus(selectedAccount.id, 'frozen')}>
                    <Ban className="w-4 h-4 mr-2" />
                    Freeze Account
                  </Button>
                ) : (
                  <Button variant="default" onClick={() => updateAccountStatus(selectedAccount.id, 'active')}>
                    <Unlock className="w-4 h-4 mr-2" />
                    Activate Account
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transfer Reject Dialog */}
      <Dialog open={!!selectedTransfer && selectedTransfer.status === 'pending_approval'} onOpenChange={() => setSelectedTransfer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transfer</DialogTitle>
            <DialogDescription>
              Transfer of ${selectedTransfer?.amount.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                placeholder="Enter reason for rejection..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTransfer(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedTransfer && rejectTransfer(selectedTransfer.id, adminNote)}
              disabled={!adminNote}
            >
              Reject Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Details Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Application #{selectedApplication?.application_number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Applicant Name</Label>
                  <p className="font-medium">{selectedApplication.first_name} {selectedApplication.last_name}</p>
                </div>
                <div>
                  <Label>Application Type</Label>
                  <p className="font-medium capitalize">{selectedApplication.application_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedApplication.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="font-medium">{selectedApplication.phone}</p>
                </div>
                <div>
                  <Label>Annual Income</Label>
                  <p className="font-medium">${(selectedApplication.annual_income || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Initial Deposit</Label>
                  <p className="font-medium">${(selectedApplication.initial_deposit_amount || 0).toLocaleString()}</p>
                </div>
              </div>

              {selectedApplication.status === 'pending' && (
                <>
                  <div className="space-y-2">
                    <Label>Admin Notes</Label>
                    <Textarea
                      placeholder="Add notes about this application..."
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button className="bg-green-500 hover:bg-green-600" onClick={() => approveApplication(selectedApplication.id)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Application
                    </Button>
                    <Button variant="destructive" onClick={() => rejectApplication(selectedApplication.id, adminNote || 'Application rejected')}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Application
                    </Button>
                  </div>
                </>
              )}

              {selectedApplication.status !== 'pending' && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Status: <Badge>{selectedApplication.status}</Badge>
                  </p>
                  {selectedApplication.admin_notes && (
                    <p className="text-sm mt-2">Notes: {selectedApplication.admin_notes}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};