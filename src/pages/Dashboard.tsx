import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { HeritageLoadingScreen } from '@/components/HeritageLoadingScreen';
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
import { ExternalBankTransfer } from '@/components/ExternalBankTransfer';
import { MobileNavigation } from '@/components/MobileNavigation';
import { ComprehensiveAdminPanel } from '@/components/ComprehensiveAdminPanel';
import { AccountSettings } from '@/components/AccountSettings';
import { CryptoExchange } from '@/components/CryptoExchange';


interface Account {
  id: string;
  account_number: string;
  account_type: string;
  status: string;
  balance: number;
  routing_number: string;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
}

interface Transfer {
  id: string;
  amount: number;
  status: string | null;
  description: string | null;
  created_at: string;
  user_id: string;
  transfer_type: string;
  from_account_id: string | null;
  to_account_id: string | null;
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
        .maybeSingle();
      
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const createDefaultAccountsIfNeeded = async () => {
    if (!user) return;
    
    try {
      const { data: existingAccounts } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', user.id);
      
      if (!existingAccounts || existingAccounts.length === 0) {
        const { error } = await supabase
          .from('accounts')
          .insert([
            {
              user_id: user.id,
              account_number: `CHK${Date.now()}`,
              account_type: 'personal_checking',
              routing_number: '123456789',
              balance: 2500.00,
              status: 'active'
            },
            {
              user_id: user.id,
              account_number: `SAV${Date.now()}`,
              account_type: 'personal_savings',
              routing_number: '123456789',
              balance: 15000.00,
              status: 'active'
            }
          ]);
        
        if (error) {
          console.error('Error creating default accounts:', error);
        }
      }
    } catch (error) {
      console.error('Error in createDefaultAccountsIfNeeded:', error);
    }
  };

  const fetchAccountData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [accountsResponse, transfersResponse] = await Promise.all([
        supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active'),
        supabase
          .from('transfers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      const { data: accountsData } = accountsResponse;
      const { data: transfersData } = transfersResponse;

      setAccounts(accountsData || []);
      setTransfers(transfersData || []);
    } catch (error) {
      console.error('Error fetching account data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    
    // Handle specific navigation actions
    if (section === 'apply-checking') {
      setApplicationType('checking');
      setShowApplicationForm(true);
    } else if (section === 'apply-savings') {
      setApplicationType('savings');
      setShowApplicationForm(true);
    } else if (section === 'apply-business') {
      setApplicationType('business');
      setShowApplicationForm(true);
    } else if (section === 'apply-credit-card') {
      setApplicationType('credit_card');
      setShowApplicationForm(true);
    } else if (section === 'apply-personal-loan') {
      setApplicationType('personal_loan');
      setShowApplicationForm(true);
    } else if (section === 'apply-home-loan') {
      setApplicationType('home_loan');
      setShowApplicationForm(true);
    } else if (section === 'apply-auto-loan') {
      setApplicationType('auto_loan');
      setShowApplicationForm(true);
    } else if (section === 'apply-business-loan') {
      setApplicationType('business_loan');
      setShowApplicationForm(true);
    } else if (section === 'personal-loan' || section === 'home-loan' || section === 'auto-loan' || section === 'business-loan') {
      // For loan services, show the application form directly
      const loanTypeMap = {
        'personal-loan': 'personal_loan',
        'home-loan': 'home_loan', 
        'auto-loan': 'auto_loan',
        'business-loan': 'business_loan'
      };
      setApplicationType(loanTypeMap[section as keyof typeof loanTypeMap] as any);
      setShowApplicationForm(true);
    } else if (section === 'card-generate') {
      setActiveSection('card-management');
    } else if (section === 'crypto-rates') {
      setActiveSection('crypto-rates');
    } else if (section === 'crypto-exchange') {
      setActiveSection('crypto-exchange');
    } else if (section === 'savings' || section === 'fixed-deposit' || section === 'investment') {
      // For investment/savings services, show application form
      setApplicationType('savings');
      setShowApplicationForm(true);
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
    return <HeritageLoadingScreen message="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <BankingHeader 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {userProfile?.first_name && userProfile?.last_name ? 
              `${userProfile.first_name} ${userProfile.last_name}` : 
              (user?.email === 'r.alcarezswo@gmail.com' ? 'Raul Alcarez' : user?.email?.split('@')[0] || 'User')}
          </h1>
          <p className="text-muted-foreground">Manage your accounts and banking services</p>
        </div>

        {/* Balance Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="md:col-span-2 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 pointer-events-none" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center justify-between">
                <span>Total Balance</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                >
                  {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold mb-2">
                {balanceVisible ? `$${totalBalance.toLocaleString()}` : '••••••••'}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span>+2.1% this month</span>
                </div>
                <div>Last updated: just now</div>
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
        {activeSection === 'accounts' && (
          <div className="space-y-6">
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
            
            <div className="grid gap-4 md:grid-cols-2">
              {accounts.map((account) => (
                <Card key={account.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg capitalize">
                        {account.account_type.replace('_', ' ').replace('personal checking', 'Heritage Checking').replace('personal savings', 'Heritage Savings')}
                      </CardTitle>
                      <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                        {account.status}
                      </Badge>
                    </div>
                    <CardDescription>••• {account.account_number.slice(-4)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Available Balance</p>
                        <p className="text-2xl font-bold">
                          {balanceVisible ? `$${account.balance.toLocaleString()}` : '••••••'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBalanceVisible(!balanceVisible)}
                      >
                        {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'transfers' && (
          <TransferSystem />
        )}

        {activeSection === 'cards' && (
          <EnhancedCreditCards />
        )}

        {activeSection === 'crypto' && (
          <CryptoWallet />
        )}

        {activeSection === 'topup' && (
          <AccountTopUp />
        )}

        {activeSection === 'statements' && (
          <AccountStatements />
        )}

        {activeSection === 'kyc' && (
          <IDMeVerification />
        )}

        {activeSection === 'settings' && (
          <AccountSettings />
        )}

        {activeSection === 'profile' && (
          <AccountSettings />
        )}

        {activeSection === 'security' && (
          <AccountSettings />
        )}

        {activeSection === 'notifications' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Notification settings will be available here. You can manage email alerts, SMS notifications, and in-app notifications.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'help' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Help & Support</CardTitle>
                <CardDescription>
                  Get assistance with your banking needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">Contact Support</div>
                      <div className="text-sm text-muted-foreground">Chat with our support team</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">FAQ</div>
                      <div className="text-sm text-muted-foreground">Find answers to common questions</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'admin' && isAdmin && (
          <ComprehensiveAdminPanel />
        )}

        {activeSection === 'card-management' && (
          <CardManagement />
        )}

        {activeSection === 'crypto-rates' && (
          <RealTimeCryptoRates />
        )}

        {activeSection === 'crypto-exchange' && (
          <CryptoExchange />
        )}

        {activeSection === 'wallet-qr' && (
          <WalletQRGenerator />
        )}

        {activeSection === 'merchant-payments' && (
          <MerchantPayments />
        )}

        {activeSection === 'external-transfer' && (
          <ExternalBankTransfer />
        )}
        
        {/* Mobile Navigation - Only visible on mobile */}
        <MobileNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
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
              <ApplicationForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}