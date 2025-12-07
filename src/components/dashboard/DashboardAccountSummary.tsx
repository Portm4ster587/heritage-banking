import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Wallet, ArrowUpRight, ArrowDownLeft, Copy, Check, TrendingUp, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  routing_number: string;
  balance: number | null;
  status: string | null;
}

export const DashboardAccountSummary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (user) {
      fetchAccounts();

      // Set up real-time subscription for balance updates
      const channel = supabase
        .channel('account-balance-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'accounts',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Account update received:', payload);
            fetchAccounts();
            setLastUpdate(new Date());
            toast({
              title: "Balance Updated",
              description: "Your account balance has been updated.",
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transfers',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Transfer detected:', payload);
            // Refresh accounts when a transfer completes
            setTimeout(() => fetchAccounts(), 1000);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: "Copied!",
      description: `${field} copied to clipboard`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatAccountType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatBalance = (balance: number | null) => {
    if (!balanceVisible) return '••••••';
    return `$${(balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance ?? 0), 0);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#0d1b2a] border-heritage-gold/30">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="h-12 bg-white/10 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Total Balance Card */}
      <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#0d1b2a] border-heritage-gold/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-heritage-gold/5 to-transparent"></div>
        <CardHeader className="relative pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white/90 text-lg font-medium flex items-center gap-2">
              <Wallet className="w-5 h-5 text-heritage-gold" />
              Total Balance
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="relative pt-0 pb-6">
          <p className="text-4xl font-bold text-white mb-4">
            {formatBalance(totalBalance)}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-400">
              <ArrowUpRight className="w-4 h-4" />
              <span>Income</span>
            </div>
            <div className="flex items-center gap-1 text-red-400">
              <ArrowDownLeft className="w-4 h-4" />
              <span>Expenses</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <Card 
            key={account.id} 
            className="bg-gradient-to-br from-[#1e3a5f] to-[#0d1b2a] border-heritage-gold/20 hover:border-heritage-gold/40 transition-all duration-300"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-heritage-gold/20 text-heritage-gold border-heritage-gold/30">
                  {formatAccountType(account.account_type)}
                </Badge>
                <span className="text-xs text-white/50">Active</span>
              </div>
              
              {/* Balance */}
              <p className="text-2xl font-bold text-white mb-4">
                {formatBalance(account.balance)}
              </p>
              
              {/* Account Number */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-xs text-white/50">Account Number</p>
                    <p className="text-sm text-white font-mono">
                      {balanceVisible 
                        ? account.account_number 
                        : `****${account.account_number.slice(-4)}`
                      }
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(account.account_number, 'Account number')}
                    className="text-white/50 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                  >
                    {copiedField === 'Account number' ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-xs text-white/50">Routing Number</p>
                    <p className="text-sm text-white font-mono">
                      {account.routing_number || '021000021'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(account.routing_number || '021000021', 'Routing number')}
                    className="text-white/50 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                  >
                    {copiedField === 'Routing number' ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
