import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Send, 
  Plus, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  Shield, 
  Bell,
  Settings,
  LogOut,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Account {
  id: string;
  account_number: string;
  type: string;
  status: string;
  balance: number;
  currency: string;
}

interface Transfer {
  id: string;
  amount: number;
  currency: string;
  status: string;
  progress: number;
  created_at: string;
  memo?: string;
}

export default function Dashboard() {
  const { user, isAdmin, signOut } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAccountData();
    }
  }, [user]);

  const fetchAccountData = async () => {
    try {
      // Fetch user accounts
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id);
      
      // Fetch recent transfers
      const { data: transfersData } = await supabase
        .from('transfers')
        .select('*')
        .or(`from_account_id.in.(${accountsData?.map(a => a.id).join(',')}),to_account_id.in.(${accountsData?.map(a => a.id).join(',')})`)
        .order('created_at', { ascending: false })
        .limit(10);

      setAccounts(accountsData || []);
      setTransfers(transfersData || []);
    } catch (error) {
      console.error('Error fetching account data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out."
    });
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">SecureBank Pro</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Badge variant="destructive" className="animate-pulse">
                  Admin
                </Badge>
              )}
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Account Status Alert */}
        {accounts.length === 0 && (
          <Card className="mb-8 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
            <CardHeader>
              <CardTitle className="text-amber-800 dark:text-amber-200">Account Activation Required</CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                To start using SecureBank Pro, you need to activate your account with a $100 deposit via cryptocurrency.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="bg-amber-600 hover:bg-amber-700">
                Activate Account
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Balance Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="md:col-span-2 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 pointer-events-none" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <CardTitle>Total Balance</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="hover:bg-white/10"
                >
                  {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold mb-2">
                {balanceVisible ? `$${totalBalance.toLocaleString()}` : '••••••'}
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+2.5% this month</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accounts.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {transfers.filter(t => t.status === 'pending').length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Accounts</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Open New Account
              </Button>
            </div>
            
            {accounts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Accounts Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by opening your first account to begin banking with us.
                  </p>
                  <Button>Open Your First Account</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {accounts.map((account) => (
                  <Card key={account.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg capitalize">
                          {account.type.replace('_', ' ')}
                        </CardTitle>
                        <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                          {account.status}
                        </Badge>
                      </div>
                      <CardDescription>••• {account.account_number.slice(-4)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-4">
                        ${account.balance.toLocaleString()}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Send className="w-4 h-4 mr-2" />
                          Transfer
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="transfers" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Transfer History</h2>
              <Button className="gap-2">
                <Send className="w-4 h-4" />
                New Transfer
              </Button>
            </div>
            
            <div className="space-y-4">
              {transfers.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Send className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Transfers Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Your transfer history will appear here once you make your first transfer.
                    </p>
                    <Button>Make Your First Transfer</Button>
                  </CardContent>
                </Card>
              ) : (
                transfers.map((transfer) => (
                  <Card key={transfer.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <ArrowUpRight className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">${transfer.amount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">
                              {transfer.memo || 'Transfer'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={transfer.status === 'completed' ? 'default' : 'secondary'}>
                            {transfer.status}
                          </Badge>
                          {transfer.status === 'processing' && (
                            <div className="mt-2">
                              <Progress value={transfer.progress} className="w-20" />
                              <p className="text-xs text-muted-foreground mt-1">
                                {transfer.progress}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="cards" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Cards</h2>
              <Button className="gap-2">
                <CreditCard className="w-4 h-4" />
                Apply for Card
              </Button>
            </div>
            
            <Card>
              <CardContent className="text-center py-12">
                <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Cards Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Apply for a credit or debit card to enhance your banking experience.
                </p>
                <Button>Apply for Your First Card</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <h2 className="text-2xl font-semibold">Profile Settings</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Manage your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">Edit Profile</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Identity Verification</CardTitle>
                  <CardDescription>Complete KYC to unlock all features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-amber-500" />
                    <span className="text-sm">Verification Required</span>
                  </div>
                  <Button>Start Verification</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}