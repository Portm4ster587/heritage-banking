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
import { BankingHeader } from '@/components/BankingHeader';

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
  const [activeSection, setActiveSection] = useState('accounts');

  useEffect(() => {
    if (user) {
      fetchAccountData();
      createDefaultAccountsIfNeeded();
    }
  }, [user]);

  const createDefaultAccountsIfNeeded = async () => {
    try {
      // Check if user already has accounts
      const { data: existingAccounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id);

      if (!existingAccounts || existingAccounts.length === 0) {
        // Create default checking account
        const { error } = await supabase
          .from('accounts')
          .insert([{
            user_id: user?.id,
            type: 'personal_checking',
            account_number: `CHK${Math.random().toString().slice(2, 12)}`,
            balance: 1000,
            status: 'active',
            currency: 'USD'
          }]);

        if (!error) {
          fetchAccountData(); // Refresh data
          toast({
            title: "Account Created",
            description: "Your checking account has been activated!"
          });
        }
      }
    } catch (error) {
      console.error('Error creating default account:', error);
    }
  };

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
      <BankingHeader activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.email}</h1>
          <p className="text-muted-foreground">Manage your accounts and banking services</p>
        </div>

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
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
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
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading accounts...</p>
              </div>
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

          <TabsContent value="investments" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Investment Portfolio</h2>
              <Button className="gap-2">
                <TrendingUp className="w-4 h-4" />
                New Investment
              </Button>
            </div>
            
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start Investing</h3>
                <p className="text-muted-foreground mb-4">
                  Build your wealth with our investment products and advisory services.
                </p>
                <Button>Explore Investment Options</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loans" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Loans & Credit</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Apply for Loan
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Loans</CardTitle>
                  <CardDescription>Quick approval for personal expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">2.9% APR</p>
                  <p className="text-sm text-muted-foreground mb-4">Starting rate</p>
                  <Button variant="outline" className="w-full">Apply Now</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Home Loans</CardTitle>
                  <CardDescription>Competitive rates for home purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">3.2% APR</p>
                  <p className="text-sm text-muted-foreground mb-4">30-year fixed</p>
                  <Button variant="outline" className="w-full">Get Pre-approved</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Auto Loans</CardTitle>
                  <CardDescription>Finance your next vehicle</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">2.5% APR</p>
                  <p className="text-sm text-muted-foreground mb-4">New vehicles</p>
                  <Button variant="outline" className="w-full">Calculate Payment</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Business Loans</CardTitle>
                  <CardDescription>Grow your business with flexible financing</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">4.1% APR</p>
                  <p className="text-sm text-muted-foreground mb-4">SBA loans available</p>
                  <Button variant="outline" className="w-full">Learn More</Button>
                </CardContent>
              </Card>
            </div>
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