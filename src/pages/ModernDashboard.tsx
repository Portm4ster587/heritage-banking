import { useState, useEffect, useCallback } from 'react';
import { WelcomeScreen } from '@/components/WelcomeScreen';
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
import { useNavigate, Link } from 'react-router-dom';
import { useComprehensiveNotifications } from '@/hooks/useComprehensiveNotifications';
import { useTransactionRealTime } from '@/hooks/useTransactionRealTime';
import { CustomerChatWidget } from '@/components/support/CustomerChatWidget';
import { format } from 'date-fns';

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

interface RecentTransaction {
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
  
  useComprehensiveNotifications();
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const fetchAll = useCallback(() => {
    if (user) {
      fetchAccountData();
      fetchRecentTransactions();
    }
  }, [user]);

  useTransactionRealTime(fetchAll);

  useEffect(() => {
    if (user) {
      fetchAccountData();
      fetchRecentTransactions();
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
        .eq('user_id', user.id)
        .maybeSingle();
      setUserProfile(data);
      
      // Show welcome screen for brand new users (no profile data yet)
      const welcomeKey = `heritage_welcomed_${user.id}`;
      if (!localStorage.getItem(welcomeKey)) {
        setShowWelcome(true);
        localStorage.setItem(welcomeKey, 'true');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    if (!user) return;
    try {
      const allTx: RecentTransaction[] = [];

      const [transfers, deposits, withdrawals, wires] = await Promise.all([
        supabase.from('transfers').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('deposit_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('withdraw_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('wire_transfers').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      ]);

      transfers.data?.forEach(t => allTx.push({
        id: t.id, description: t.description || `Transfer to ${t.recipient_name || 'account'}`,
        amount: -t.amount, date: t.created_at || new Date().toISOString(), type: 'debit', category: 'Transfer'
      }));
      deposits.data?.forEach(d => allTx.push({
        id: d.id, description: `${d.method} Deposit`, amount: d.amount,
        date: d.created_at || new Date().toISOString(), type: 'credit', category: 'Deposit'
      }));
      withdrawals.data?.forEach(w => allTx.push({
        id: w.id, description: `${w.method} Withdrawal`, amount: -w.amount,
        date: w.created_at || new Date().toISOString(), type: 'debit', category: 'Withdrawal'
      }));
      wires.data?.forEach(w => allTx.push({
        id: w.id, description: `Wire to ${w.recipient_name}`, amount: -w.amount,
        date: w.created_at || new Date().toISOString(), type: 'debit', category: 'Wire'
      }));

      allTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentTransactions(allTx.slice(0, 8));
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
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
      {/* Welcome Screen for new users */}
      {showWelcome && (
        <WelcomeScreen 
          userName={userProfile?.first_name || user?.email?.split('@')[0] || 'there'}
          onDismiss={() => setShowWelcome(false)}
        />
      )}
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
                {/* Primary actions - always visible */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { href: '/dashboard/transfers', icon: Send, label: 'Send Money', primary: true },
                    { href: '/dashboard/topup', icon: ArrowDownRight, label: 'Deposit' },
                    { href: '/dashboard/withdraw', icon: ArrowUpRight, label: 'Withdraw' },
                    { href: '/dashboard/crypto', icon: TrendingUp, label: 'Crypto' },
                    { href: '/dashboard/cards', icon: CreditCard, label: 'Cards' },
                    { href: '/dashboard/bills', icon: Receipt, label: 'Bills' },
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
                
                {/* More actions - collapsible */}
                <details className="mt-3 group">
                  <summary className="text-xs text-primary font-medium cursor-pointer text-center py-2 hover:underline list-none flex items-center justify-center gap-1">
                    <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                    More Actions
                  </summary>
                  <div className="grid grid-cols-3 gap-3 mt-3 animate-fade-in">
                    {[
                      { href: '/dashboard/history', icon: CreditCard, label: 'History' },
                      { href: '/dashboard/profile', icon: User, label: 'Profile' },
                      { href: '/dashboard/statements', icon: FileText, label: 'Statements' },
                      { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
                      { href: '/dashboard/notifications', icon: Receipt, label: 'Alerts' },
                      { href: '/contact', icon: User, label: 'Support' },
                    ].map((item) => (
                      <a key={item.href} href={item.href}>
                        <div className="flex flex-col items-center justify-center p-3 rounded-xl border bg-card hover:bg-accent/50 border-border transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer">
                          <item.icon className="w-5 h-5 mb-1.5" />
                          <span className="text-[11px] font-medium text-center leading-tight">{item.label}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </details>
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
                {recentTransactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                ) : recentTransactions.slice(0, 6).map((transaction) => (
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
                        <p className="text-sm font-medium text-foreground">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
                <a href="/dashboard/history">
                  <Button variant="ghost" className="w-full text-primary hover:text-primary/80">
                    View All Activity
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Customer Support Chat Widget */}
      <CustomerChatWidget />
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 safe-area-inset-bottom">
        <div className="flex justify-around items-center py-1">
          {[
            { href: '/dashboard', icon: Landmark, label: 'Home' },
            { href: '/dashboard/transfers', icon: Send, label: 'Transfer' },
            { href: '/dashboard/topup', icon: ArrowDownRight, label: 'Deposit' },
            { href: '/dashboard/crypto', icon: TrendingUp, label: 'Crypto' },
            { href: '/dashboard/settings', icon: Settings, label: 'More' },
          ].map((item) => (
            <a key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 px-2 py-1.5 text-muted-foreground hover:text-primary transition-colors">
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </a>
          ))}
        </div>
      </nav>
      {/* Bottom spacer for mobile nav */}
      <div className="md:hidden h-16" />
    </div>
  );
}