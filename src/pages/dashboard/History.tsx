import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AccountStatements } from "@/components/AccountStatements";
import { RealTimeInvestmentHistory } from "@/components/RealTimeInvestmentHistory";
import { BackButton } from "@/components/BackButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, TrendingUp, History, RefreshCw, ArrowUpCircle, ArrowDownCircle, Send, Landmark, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface RealTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
  recipient?: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState<RealTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    document.title = "First Heritage Bank of America - Transaction History";
    if (user) {
      fetchRealTransactions();
      setupRealTimeSubscription();
    }
    
    return () => {
      supabase.removeAllChannels();
    };
  }, [user]);

  const setupRealTimeSubscription = () => {
    if (!user) return;

    // Subscribe to real-time updates on all transaction tables
    const channel = supabase
      .channel('transaction-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transfers', filter: `user_id=eq.${user.id}` }, () => fetchRealTransactions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deposit_requests', filter: `user_id=eq.${user.id}` }, () => fetchRealTransactions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdraw_requests', filter: `user_id=eq.${user.id}` }, () => fetchRealTransactions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wire_transfers', filter: `user_id=eq.${user.id}` }, () => fetchRealTransactions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ach_transfers', filter: `user_id=eq.${user.id}` }, () => fetchRealTransactions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'check_deposits', filter: `user_id=eq.${user.id}` }, () => fetchRealTransactions())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchRealTransactions = async () => {
    if (!user) return;
    
    try {
      const allTransactions: RealTransaction[] = [];

      // Fetch all transaction types in parallel
      const [transfers, deposits, withdrawals, wires, ach, checks] = await Promise.all([
        supabase.from('transfers').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
        supabase.from('deposit_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
        supabase.from('withdraw_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
        supabase.from('wire_transfers').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
        supabase.from('ach_transfers').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
        supabase.from('check_deposits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
      ]);

      transfers.data?.forEach(t => {
        allTransactions.push({
          id: t.id,
          type: 'transfer',
          amount: t.amount,
          status: t.status || 'pending',
          description: t.description || `Transfer to ${t.recipient_name || 'account'}`,
          created_at: t.created_at || new Date().toISOString(),
          recipient: t.recipient_name || undefined
        });
      });

      deposits.data?.forEach(d => {
        allTransactions.push({
          id: d.id,
          type: 'deposit',
          amount: d.amount,
          status: d.status || 'pending',
          description: `${d.method} deposit`,
          created_at: d.created_at || new Date().toISOString(),
        });
      });

      withdrawals.data?.forEach(w => {
        allTransactions.push({
          id: w.id,
          type: 'withdrawal',
          amount: w.amount,
          status: w.status || 'pending',
          description: `${w.method} withdrawal to ${w.destination}`,
          created_at: w.created_at || new Date().toISOString(),
        });
      });

      wires.data?.forEach(w => {
        allTransactions.push({
          id: w.id,
          type: 'wire',
          amount: w.amount,
          status: w.status || 'pending',
          description: `Wire to ${w.recipient_name} at ${w.recipient_bank}`,
          created_at: w.created_at || new Date().toISOString(),
          recipient: w.recipient_name
        });
      });

      ach.data?.forEach(a => {
        allTransactions.push({
          id: a.id,
          type: 'ach',
          amount: a.amount,
          status: a.status || 'pending',
          description: `ACH ${a.transfer_direction} - ${a.description || 'transfer'}`,
          created_at: a.created_at || new Date().toISOString(),
        });
      });

      checks.data?.forEach(c => {
        allTransactions.push({
          id: c.id,
          type: 'check',
          amount: c.amount,
          status: c.status || 'pending',
          description: `Check deposit from ${c.payer_name || 'unknown'}`,
          created_at: c.created_at || new Date().toISOString(),
        });
      });

      // Sort by date
      allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRealTransactions();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transfer': return <Send className="w-4 h-4 text-blue-500" />;
      case 'deposit': return <ArrowDownCircle className="w-4 h-4 text-green-500" />;
      case 'withdrawal': return <ArrowUpCircle className="w-4 h-4 text-red-500" />;
      case 'wire': return <Send className="w-4 h-4 text-purple-500" />;
      case 'ach': return <Landmark className="w-4 h-4 text-indigo-500" />;
      case 'check': return <FileText className="w-4 h-4 text-orange-500" />;
      default: return <History className="w-4 h-4 text-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30 animate-fade-in">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 animate-pulse">Pending</Badge>;
      case 'pending_approval':
        return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30 animate-pulse">Awaiting Approval</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Rejected</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Approved</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-6 w-[100px]" />
        </div>
      ))}
    </div>
  );

  return (
    <main className="container mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
      <BackButton to="/dashboard" label="Back to Dashboard" className="mb-4" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-heritage-gold bg-clip-text text-transparent">
          Transaction History
        </h1>
        <p className="text-muted-foreground">Real-time updates • View your account statements, transactions, and investment history</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="flex items-center gap-1 text-xs text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Updates Active
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 banking-tabs overflow-x-auto">
          <TabsTrigger value="transactions" className="flex items-center gap-2 transition-all duration-300">
            <History className="w-4 h-4" />
            All Transactions
          </TabsTrigger>
          <TabsTrigger value="statements" className="flex items-center gap-2 transition-all duration-300">
            <FileText className="w-4 h-4" />
            Investment Statements
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2 transition-all duration-300">
            <TrendingUp className="w-4 h-4" />
            Investment History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="tab-content-animate">
          <Card className="hightech-card">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <History className="w-5 h-5" />
                Recent Transactions
                <Badge variant="secondary" className="ml-2">{transactions.length}</Badge>
              </CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={handleRefresh} disabled={refreshing}>
                  {refreshing ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-1" />
                  )}
                  <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </Button>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => navigate('/dashboard/transactions')}>
                  <ExternalLink className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Full History</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <LoadingSkeleton />
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground animate-fade-in">
                  <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No transactions found</p>
                  <p className="text-sm">Your transactions will appear here in real-time</p>
                </div>
              ) : (
                <>
                {/* Mobile-friendly list for small screens */}
                <div className="block sm:hidden divide-y divide-border">
                  {transactions.slice(0, 30).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-3 px-1">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          ['deposit', 'check'].includes(tx.type) ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {getTypeIcon(tx.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(tx.created_at), 'MMM dd, h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className={`text-sm font-bold ${['deposit', 'check'].includes(tx.type) ? 'text-green-600' : 'text-red-600'}`}>
                          {['deposit', 'check'].includes(tx.type) ? '+' : '-'}${tx.amount.toLocaleString()}
                        </p>
                        {getStatusBadge(tx.status)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <Table className="hidden sm:table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 30).map((tx, index) => (
                      <TableRow 
                        key={tx.id} 
                        className="animate-fade-in hover:bg-muted/50 transition-colors"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(tx.created_at), 'MMM dd, yyyy')}
                          <span className="block text-xs text-muted-foreground">
                            {format(new Date(tx.created_at), 'h:mm a')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(tx.type)}
                            <span className="capitalize font-medium">{tx.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate">
                          {tx.description}
                        </TableCell>
                        <TableCell className={`font-bold ${['deposit', 'check'].includes(tx.type) ? 'text-green-600' : 'text-red-600'}`}>
                          {['deposit', 'check'].includes(tx.type) ? '+' : '-'}${tx.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statements" className="tab-content-animate">
          <AccountStatements />
        </TabsContent>

        <TabsContent value="realtime" className="tab-content-animate">
          <RealTimeInvestmentHistory />
        </TabsContent>
      </Tabs>
    </main>
  );
}