import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
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
  Clock,
  User,
  Building,
  Home,
  Car,
  FileText,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BankingHeader } from '@/components/BankingHeader';
import { ApplicationForm } from '@/components/ApplicationForm';
import { AdminPanel } from '@/components/AdminPanel';
import { EnhancedCreditCards } from '@/components/EnhancedCreditCards';
import { TransferSystem } from '@/components/TransferSystem';
import { CryptoWallet } from '@/components/CryptoWallet';
import { AccountTopUp } from '@/components/AccountTopUp';
import { AccountStatements } from '@/components/AccountStatements';
import { IDMeVerification } from '@/components/IDMeVerification';
import { EnhancedAdminPanel } from '@/components/EnhancedAdminPanel';
import { CardManagement } from '@/components/CardManagement';
import { RealTimeCryptoRates } from '@/components/RealTimeCryptoRates';
import { WalletQRGenerator } from '@/components/WalletQRGenerator';
import { MerchantPayments } from '@/components/MerchantPayments';

interface Account {
  id: string;
  account_number: string;
  type: string;
  status: string;
  balance: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'USDT';
  metadata?: any;
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
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationType, setApplicationType] = useState<'checking' | 'savings' | 'business' | 'credit_card' | 'personal_loan' | 'home_loan' | 'auto_loan' | 'business_loan'>('checking');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchAccountData();
      createDefaultAccountsIfNeeded();
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const createDefaultAccountsIfNeeded = async () => {
    try {
      // Check if user already has accounts
      const { data: existingAccounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id);

      if (!existingAccounts || existingAccounts.length === 0) {
        // Create specific accounts for r.alcarezswo@gmail.com
        if (user?.email === 'r.alcarezswo@gmail.com') {
          const accountsToCreate = [
            {
              user_id: user.id,
              type: 'personal_checking' as const,
              account_number: `CHK${Math.random().toString().slice(2, 12)}`,
              balance: 59765,
              status: 'active' as const,
              currency: 'USD' as const
            },
            {
              user_id: user.id,
              type: 'personal_savings' as const,
              account_number: `SAV${Math.random().toString().slice(2, 12)}`,
              balance: 67899,
              status: 'active' as const,
              currency: 'USD' as const
            },
            {
              user_id: user.id,
              type: 'business_savings' as const,
              account_number: `BSV${Math.random().toString().slice(2, 12)}`,
              balance: 786656,
              status: 'active' as const,
              currency: 'USD' as const
            },
            {
              user_id: user.id,
              type: 'personal_checking' as const,
              account_number: `MTG${Math.random().toString().slice(2, 12)}`,
              balance: -487890,
              status: 'active' as const,
              currency: 'USD' as const,
              metadata: { loan_progress: 84, total_amount: 580000 }
            }
          ];

          const { error } = await supabase
            .from('accounts')
            .insert(accountsToCreate);

          if (!error) {
            fetchAccountData();
            toast({
              title: "Welcome Back!",
              description: "Your accounts have been loaded successfully."
            });
          }
        } else {
          // Create default checking account for other users
          const { error } = await supabase
            .from('accounts')
            .insert([{
              user_id: user?.id,
              type: 'personal_checking' as const,
              account_number: `CHK${Math.random().toString().slice(2, 12)}`,
              balance: 1000,
              status: 'active' as const,
              currency: 'USD' as const
            }]);

          if (!error) {
            fetchAccountData();
            toast({
              title: "Account Created",
              description: "Your checking account has been activated!"
            });
          }
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
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {userProfile?.first_name || user?.email?.split('@')[0] || 'User'}
          </h1>
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
          <TabsList className="grid w-full grid-cols-11">
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="topup">Top Up</TabsTrigger>
            <TabsTrigger value="statements">Statements</TabsTrigger>
            <TabsTrigger value="kyc">ID Verify</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
          </TabsList>

          <TabsContent value="accounts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Accounts</h2>
              <Button 
                className="gap-2"
                onClick={() => {
                  setApplicationType('checking');
                  setShowApplicationForm(true);
                }}
              >
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
                          {account.type.replace('_', ' ').replace('heritage', 'Heritage')}
                        </CardTitle>
                        <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                          {account.status}
                        </Badge>
                      </div>
                      <CardDescription>••• {account.account_number.slice(-4)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-4">
                        {account.balance < 0 ? 
                          `-$${Math.abs(account.balance).toLocaleString()}` : 
                          `$${account.balance.toLocaleString()}`
                        }
                      </div>
                      {account.balance < 0 && account.metadata?.loan_progress && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Paid Off</span>
                            <span>{account.metadata.loan_progress}%</span>
                          </div>
                          <Progress value={account.metadata.loan_progress} className="h-2" />
                        </div>
                      )}
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
              <Button 
                className="gap-2"
                onClick={() => {
                  setApplicationType('business');
                  setShowApplicationForm(true);
                }}
              >
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
                <Button
                  onClick={() => {
                    setApplicationType('business');
                    setShowApplicationForm(true);
                  }}
                >
                  Explore Investment Options
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loans" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Loans & Credit</h2>
              <Button 
                className="gap-2"
                onClick={() => {
                  setApplicationType('personal_loan');
                  setShowApplicationForm(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Apply for Loan
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                setApplicationType('personal_loan');
                setShowApplicationForm(true);
              }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Personal Loans
                  </CardTitle>
                  <CardDescription>Quick approval for personal expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-success">2.9% APR</p>
                  <p className="text-sm text-muted-foreground mb-4">Starting rate</p>
                  <Button variant="outline" className="w-full">Apply Now</Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                setApplicationType('home_loan');
                setShowApplicationForm(true);
              }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Home Loans
                  </CardTitle>
                  <CardDescription>Competitive rates for home purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-success">3.2% APR</p>
                  <p className="text-sm text-muted-foreground mb-4">30-year fixed</p>
                  <Button variant="outline" className="w-full">Get Pre-approved</Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                setApplicationType('auto_loan');
                setShowApplicationForm(true);
              }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Auto Loans
                  </CardTitle>
                  <CardDescription>Finance your next vehicle</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-success">2.5% APR</p>
                  <p className="text-sm text-muted-foreground mb-4">New vehicles</p>
                  <Button variant="outline" className="w-full">Calculate Payment</Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                setApplicationType('business_loan');
                setShowApplicationForm(true);
              }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Business Loans
                  </CardTitle>
                  <CardDescription>Grow your business with flexible financing</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-success">4.1% APR</p>
                  <p className="text-sm text-muted-foreground mb-4">SBA loans available</p>
                  <Button variant="outline" className="w-full">Learn More</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transfers" className="space-y-4">
            <TransferSystem />
          </TabsContent>

          <TabsContent value="cards" className="space-y-4">
            <CardManagement />
          </TabsContent>

          <TabsContent value="crypto" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <RealTimeCryptoRates />
              </div>
              <div className="space-y-6">
                <CryptoWallet />
                {isAdmin && <WalletQRGenerator />}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <MerchantPayments />
          </TabsContent>

          <TabsContent value="topup" className="space-y-4">
            <AccountTopUp />
          </TabsContent>

          <TabsContent value="statements" className="space-y-4">
            <AccountStatements />
          </TabsContent>

          <TabsContent value="kyc" className="space-y-4">
            <IDMeVerification />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <h2 className="text-2xl font-semibold">Profile Settings</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Manage your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <Label>Name</Label>
                    <p className="font-medium">
                      {userProfile?.first_name} {userProfile?.last_name || 'Not provided'}
                    </p>
                  </div>
                  <Button variant="outline">Edit Profile</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Identity Verification</CardTitle>
                  <CardDescription>Verify your identity with ID.me for enhanced security</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-warning" />
                    <Badge variant="secondary">ID.me Verification Available</Badge>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => window.open('https://www.id.me/', '_blank')}
                  >
                    Verify with ID.me
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Admin Panel Tab */}
          {isAdmin && (
            <TabsContent value="admin" className="space-y-4">
              <EnhancedAdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-lg shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Banking Application</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApplicationForm(false)}
                >
                  ✕
                </Button>
              </div>
              <ApplicationForm
                applicationType={applicationType}
                onSuccess={() => {
                  setShowApplicationForm(false);
                  toast({
                    title: "Application Submitted",
                    description: "Your application has been submitted successfully!"
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}