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
import { FileText, TrendingUp, History, RefreshCw, ArrowUpCircle, ArrowDownCircle, Send, Landmark, ExternalLink } from "lucide-react";
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

  useEffect(() => {
    document.title = "Heritage Bank - Transaction History";
    if (user) {
      fetchRealTransactions();
    }
  }, [user]);

  const fetchRealTransactions = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const allTransactions: RealTransaction[] = [];

      // Fetch all transaction types in parallel
      const [transfers, deposits, withdrawals, wires, ach, checks] = await Promise.all([
        supabase.from('transfers').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('deposit_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('withdraw_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('wire_transfers').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('ach_transfers').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('check_deposits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
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
    }
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
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Pending</Badge>;
      case 'pending_approval':
        return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">Awaiting Approval</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <main className="container mx-auto px-6 py-8">
      <BackButton to="/dashboard" label="Back to Dashboard" className="mb-4" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Transaction History</h1>
        <p className="text-muted-foreground">View your account statements, transactions, and investment history</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            All Transactions
          </TabsTrigger>
          <TabsTrigger value="statements" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Investment Statements
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Investment History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Transactions
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchRealTransactions}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/transaction-history')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Full History
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions found</p>
                  <p className="text-sm">Your transactions will appear here</p>
                </div>
              ) : (
                <Table>
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
                    {transactions.slice(0, 20).map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(tx.created_at), 'MMM dd, yyyy')}
                          <span className="block text-xs text-muted-foreground">
                            {format(new Date(tx.created_at), 'h:mm a')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(tx.type)}
                            <span className="capitalize">{tx.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {tx.description}
                        </TableCell>
                        <TableCell className={`font-semibold ${['deposit', 'check'].includes(tx.type) ? 'text-green-600' : 'text-red-600'}`}>
                          {['deposit', 'check'].includes(tx.type) ? '+' : '-'}${tx.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statements">
          <AccountStatements />
        </TabsContent>

        <TabsContent value="realtime">
          <RealTimeInvestmentHistory />
        </TabsContent>
      </Tabs>
    </main>
  );
}
