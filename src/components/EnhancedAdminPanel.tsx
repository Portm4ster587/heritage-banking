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
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Eye,
  Edit,
  AlertTriangle,
  CreditCard,
  Building,
  Home,
  Car,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Bitcoin,
  Banknote,
  RefreshCw
} from 'lucide-react';

interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  user_id?: string;
  related_id?: string;
  related_type?: string;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
}

interface DepositRequest {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  method: string;
  status: string;
  created_at: string;
  notes?: string;
  processed_by_admin_id?: string;
  processed_at?: string;
  reference_number?: string;
}

interface WithdrawRequest {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  method: string;
  status: string;
  destination: string;
  created_at: string;
  notes?: string;
  processed_by_admin_id?: string;
  processed_at?: string;
  reference_number?: string;
}

interface Transaction {
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

export const EnhancedAdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
      
      // Set up real-time subscriptions
      const notificationsSub = supabase
        .channel('admin_notifications')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'admin_notifications' },
          () => fetchNotifications()
        )
        .subscribe();

      const depositsSub = supabase
        .channel('deposit_requests')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'deposit_requests' },
          () => fetchDepositRequests()
        )
        .subscribe();

      const withdrawsSub = supabase
        .channel('withdraw_requests')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'withdraw_requests' },
          () => fetchWithdrawRequests()
        )
        .subscribe();

      return () => {
        notificationsSub.unsubscribe();
        depositsSub.unsubscribe();
        withdrawsSub.unsubscribe();
      };
    }
  }, [isAdmin]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchNotifications(),
      fetchDepositRequests(),
      fetchWithdrawRequests(),
      fetchTransactions()
    ]);
    setLoading(false);
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications((data || []).map(item => ({
        ...item,
        priority: item.priority as 'low' | 'normal' | 'high' | 'urgent'
      })));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchDepositRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('deposit_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDepositRequests(data || []);
    } catch (error) {
      console.error('Error fetching deposit requests:', error);
    }
  };

  const fetchWithdrawRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('withdraw_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWithdrawRequests(data || []);
    } catch (error) {
      console.error('Error fetching withdraw requests:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const updateDepositStatus = async (depositId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('deposit_requests')
        .update({
          status,
          notes: notes,
          processed_by_admin_id: user?.id,
          ...(status === 'completed' && { processed_at: new Date().toISOString() })
        })
        .eq('id', depositId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Deposit request ${status}`,
      });

      fetchDepositRequests();
    } catch (error) {
      console.error('Error updating deposit status:', error);
      toast({
        title: "Error",
        description: "Failed to update deposit status",
        variant: "destructive"
      });
    }
  };

  const updateWithdrawStatus = async (withdrawId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('withdraw_requests')
        .update({
          status,
          notes: notes,
          processed_by_admin_id: user?.id,
          ...(status === 'completed' && { processed_at: new Date().toISOString() })
        })
        .eq('id', withdrawId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Withdraw request ${status}`,
      });

      fetchWithdrawRequests();
    } catch (error) {
      console.error('Error updating withdraw status:', error);
      toast({
        title: "Error",
        description: "Failed to update withdraw status",
        variant: "destructive"
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-warning mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You don't have admin privileges to access this panel.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.is_read).length;
  const pendingDeposits = depositRequests.filter(d => d.status === 'pending').length;
  const pendingWithdraws = withdrawRequests.filter(w => w.status === 'pending').length;
  const recentTransactions = transactions.filter(t => 
    new Date(t.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Admin Panel</h1>
          <p className="text-muted-foreground">Comprehensive banking administration</p>
        </div>
        <Button onClick={fetchAllData} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`${unreadNotifications > 0 ? 'border-red-500 bg-red-50 dark:bg-red-950' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread Alerts</p>
                <p className="text-2xl font-bold text-red-500">{unreadNotifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`${pendingDeposits > 0 ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ArrowDownCircle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Deposits</p>
                <p className="text-2xl font-bold text-yellow-500">{pendingDeposits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`${pendingWithdraws > 0 ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ArrowUpCircle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Withdraws</p>
                <p className="text-2xl font-bold text-orange-500">{pendingWithdraws}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Transactions</p>
                <p className="text-2xl font-bold text-green-500">{recentTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications {unreadNotifications > 0 && `(${unreadNotifications})`}
          </TabsTrigger>
          <TabsTrigger value="deposits">
            Deposits {pendingDeposits > 0 && `(${pendingDeposits})`}
          </TabsTrigger>
          <TabsTrigger value="withdraws">
            Withdraws {pendingWithdraws > 0 && `(${pendingWithdraws})`}
          </TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className={`p-3 rounded-lg border ${!notification.is_read ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={notification.priority === 'urgent' ? 'destructive' : 'secondary'}>
                          {notification.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...depositRequests.slice(0, 3), ...withdrawRequests.slice(0, 2)].map((request) => (
                    <div key={request.id} className="p-3 rounded-lg border bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {'method' in request && request.method === 'crypto' ? 
                            <Bitcoin className="w-4 h-4" /> : 
                            <Banknote className="w-4 h-4" />
                          }
                          <div>
                            <p className="font-medium text-sm">
                              {'destination_details' in request ? 'Withdrawal' : 'Deposit'} - ${request.amount}
                            </p>
                            <p className="text-xs text-muted-foreground">{request.method}</p>
                          </div>
                        </div>
                        <Badge variant={request.status === 'pending' ? 'secondary' : 'default'}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>System alerts and important updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 rounded-lg border ${!notification.is_read ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Bell className="w-4 h-4" />
                          <h4 className="font-semibold">{notification.title}</h4>
                          <Badge variant={notification.priority === 'urgent' ? 'destructive' : 'secondary'}>
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Requests</CardTitle>
              <CardDescription>Review and approve user deposit requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {depositRequests.map((deposit) => (
                  <div key={deposit.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <ArrowDownCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-semibold">${deposit.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{deposit.method}</p>
                        </div>
                      </div>
                      <Badge variant={deposit.status === 'pending' ? 'secondary' : 'default'}>
                        {deposit.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {new Date(deposit.created_at).toLocaleString()}
                      </p>
                      {deposit.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateDepositStatus(deposit.id, 'processing')}
                          >
                            Process
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateDepositStatus(deposit.id, 'completed')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateDepositStatus(deposit.id, 'failed', 'Rejected by admin')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraws" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>Review and approve user withdrawal requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {withdrawRequests.map((withdraw) => (
                  <div key={withdraw.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <ArrowUpCircle className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="font-semibold">${withdraw.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{withdraw.method}</p>
                        </div>
                      </div>
                      <Badge variant={withdraw.status === 'pending' ? 'secondary' : 'default'}>
                        {withdraw.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {new Date(withdraw.created_at).toLocaleString()}
                      </p>
                      {withdraw.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateWithdrawStatus(withdraw.id, 'processing')}
                          >
                            Process
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateWithdrawStatus(withdraw.id, 'completed')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateWithdrawStatus(withdraw.id, 'failed', 'Rejected by admin')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>Monitor all system transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-4 h-4" />
                        <div>
                          <p className="font-medium">${transaction.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.description || 'Transfer'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(transaction.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};