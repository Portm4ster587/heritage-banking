import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeritageLoadingScreen } from '@/components/HeritageLoadingScreen';
import { 
  Eye, 
  EyeOff, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building,
  PiggyBank,
  Landmark,
  Plus,
  Send,
  Settings,
  User,
  ChevronRight,
  FileText,
  Receipt
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AccountDetailsPanel } from '@/components/dashboard/AccountDetailsPanel';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useNavigate } from 'react-router-dom';
import { useComprehensiveNotifications } from '@/hooks/useComprehensiveNotifications';
import { CustomerChatWidget } from '@/components/support/CustomerChatWidget';

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

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'credit' | 'debit';
  category: string;
}

export default function ModernDashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Comprehensive real-time notifications with SMS, email, and push
  useComprehensiveNotifications();
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions] = useState<Transaction[]>([
    { id: '1', description: 'Direct Deposit - Salary', amount: 5420.00, date: '2024-01-15', type: 'credit', category: 'Income' },
    { id: '2', description: 'Online Transfer', amount: -250.00, date: '2024-01-14', type: 'debit', category: 'Transfer' },
    { id: '3', description: 'Grocery Store', amount: -87.45, date: '2024-01-13', type: 'debit', category: 'Shopping' },
    { id: '4', description: 'Interest Payment', amount: 12.50, date: '2024-01-12', type: 'credit', category: 'Interest' },
  ]);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);
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
              account_number: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
              account_type: 'personal_checking',
              routing_number: '021000021',
              balance: 0,
              status: 'active'
            },
            {
              user_id: user.id,
              account_number: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
              account_type: 'personal_savings',
              routing_number: '021000021',
              balance: 0,
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
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      setAccounts(accountsData || []);
    } catch (error) {
      console.error('Error fetching account data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out securely."
      });
    } catch (error) {
      toast({
        title: "Sign out error",
        description: "There was an issue signing you out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'personal_checking':
        return Landmark;
      case 'personal_savings':
        return PiggyBank;
      case 'business':
        return Building;
      default:
        return CreditCard;
    }
  };

  const getAccountDisplayName = (accountType: string) => {
    switch (accountType) {
      case 'personal_checking':
        return 'Heritage Checking';
      case 'personal_savings':
        return 'Heritage Savings';
      case 'business':
        return 'Business Account';
      default:
        return accountType.replace('_', ' ');
    }
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  if (loading) {
    return <HeritageLoadingScreen message="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50">
      {/* Modern Header with Full Profile Menu */}
      <DashboardHeader onSectionChange={(section) => {
        if (section === 'accounts') navigate('/dashboard');
        else navigate(`/dashboard/${section}`);
      }} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Gradient */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-2">
            Good morning, {userProfile?.first_name || user?.email?.split('@')[0] || 'there'}
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your money today.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Accounts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Summary with Enhanced Gradient */}
            <Card className="hightech-gradient text-white shadow-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-heritage-blue-dark to-primary-dark" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
              <CardHeader className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-medium text-white/90">
                      Total Balance
                    </CardTitle>
                    <div className="flex items-center mt-2">
                      <span className="text-4xl font-bold neon-balance">
                        {balanceVisible ? `$${totalBalance.toLocaleString()}` : '••••••••'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBalanceVisible(!balanceVisible)}
                        className="ml-3 text-white hover:bg-white/20"
                      >
                        {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    <TrendingUp className="w-4 h-4 mr-1 text-green-300" />
                    <span className="text-sm text-green-300 font-medium">+2.1%</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Accounts List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Your Accounts</h2>
                <a href="/">
                  <Button className="banking-button text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Open Account
                  </Button>
                </a>
              </div>

              {accounts.map((account) => (
                <AccountDetailsPanel
                  key={account.id}
                  account={account}
                  balanceVisible={balanceVisible}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions Grid */}
            <Card className="hightech-card overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-heritage-gold/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { href: '/dashboard/transfers', icon: Send, label: 'Send Money', primary: true },
                    { href: '/dashboard/topup', icon: ArrowDownRight, label: 'Deposit' },
                    { href: '/dashboard/withdraw', icon: ArrowUpRight, label: 'Withdraw' },
                    { href: '/dashboard/crypto', icon: TrendingUp, label: 'Crypto' },
                    { href: '/dashboard/cards', icon: CreditCard, label: 'Cards' },
                    { href: '/dashboard/bills', icon: Receipt, label: 'Bills' },
                    { href: '/dashboard/history', icon: CreditCard, label: 'History' },
                    { href: '/dashboard/profile', icon: User, label: 'Profile' },
                    { href: '/dashboard/statements', icon: FileText, label: 'Statements' },
                    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
                  ].map((item) => (
                    <a key={item.href} href={item.href}>
                      <div className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer ${
                        item.primary 
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                          : 'bg-card hover:bg-accent/50 border-border'
                      }`}>
                        <item.icon className="w-5 h-5 mb-1.5" />
                        <span className="text-[11px] font-medium text-center leading-tight">{item.label}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="hightech-card">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-heritage-gold/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Recent Activity
                  <span className="flex items-center gap-1 text-xs text-green-600 font-normal ml-auto">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {transactions.slice(0, 4).map((transaction, idx) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-slate-900'
                    }`}>
                      {transaction.type === 'credit' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700">
                  View All Activity
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Customer Support Chat Widget */}
      <CustomerChatWidget />
    </div>
  );
}