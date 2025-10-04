import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  MoreHorizontal,
  Bell,
  Settings,
  LogOut,
  User,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
              account_number: `CHK${Date.now()}`,
              account_type: 'personal_checking',
              routing_number: '123456789',
              balance: 12547.83,
              status: 'active'
            },
            {
              user_id: user.id,
              account_number: `SAV${Date.now()}`,
              account_type: 'personal_savings',
              routing_number: '123456789',
              balance: 45680.92,
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600">Loading your accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modern Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-xl font-semibold text-slate-900">Heritage Bank</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4">
                Accounts
              </button>
              <button className="text-slate-600 hover:text-slate-900 pb-4">
                Transfer
              </button>
              <button className="text-slate-600 hover:text-slate-900 pb-4">
                Pay Bills
              </button>
              <button className="text-slate-600 hover:text-slate-900 pb-4">
                Deposit
              </button>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {userProfile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {userProfile?.first_name && userProfile?.last_name 
                          ? `${userProfile.first_name} ${userProfile.last_name}`
                          : user?.email?.split('@')[0]
                        }
                      </p>
                      <p className="text-xs text-slate-500">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">
            Good morning, {userProfile?.first_name || user?.email?.split('@')[0] || 'there'}
          </h1>
          <p className="text-slate-600">Here's what's happening with your money today.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Accounts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Summary */}
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-medium text-blue-100">
                      Total Balance
                    </CardTitle>
                    <div className="flex items-center mt-2">
                      <span className="text-3xl font-bold">
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
                  <div className="flex items-center text-green-300">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+2.1%</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Accounts List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">Your Accounts</h2>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Open Account
                </Button>
              </div>

              {accounts.map((account) => {
                const IconComponent = getAccountIcon(account.account_type);
                return (
                  <Card key={account.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-slate-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {getAccountDisplayName(account.account_type)}
                            </h3>
                            <p className="text-sm text-slate-500">
                              ••••{account.account_number.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-slate-900">
                            {balanceVisible ? `$${account.balance.toLocaleString()}` : '••••••'}
                          </p>
                          <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                            {account.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white">
                  <Send className="w-4 h-4 mr-3" />
                  Send Money
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ArrowDownRight className="w-4 h-4 mr-3" />
                  Deposit Check
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-3" />
                  Pay Bills
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {transactions.slice(0, 4).map((transaction) => (
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
    </div>
  );
}