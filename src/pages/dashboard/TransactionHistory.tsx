import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Search, 
  Download, 
  Filter, 
  CalendarIcon, 
  ArrowUpRight, 
  ArrowDownLeft,
  RefreshCw,
  FileText,
  X,
  Send,
  Landmark,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import { BankingHeader } from '@/components/BankingHeader';
import { HeritageLoadingScreen } from '@/components/HeritageLoadingScreen';

interface Transaction {
  id: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'wire' | 'ach' | 'check';
  reference?: string;
  recipient?: string;
  method?: string;
}

export default function TransactionHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [activeSection, setActiveSection] = useState('history');

  useEffect(() => {
    document.title = "Heritage Bank - Transaction History";
    if (user) {
      fetchAllTransactions();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchTerm, typeFilter, statusFilter, dateFrom, dateTo]);

  const fetchAllTransactions = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const allTransactions: Transaction[] = [];

      // Fetch transfers
      const { data: transfers } = await supabase
        .from('transfers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      transfers?.forEach(t => {
        allTransactions.push({
          id: t.id,
          type: 'transfer',
          amount: t.amount,
          status: t.status || 'pending',
          description: t.description || `Transfer to ${t.recipient_name || 'account'}`,
          created_at: t.created_at || new Date().toISOString(),
          reference: t.id.slice(0, 8),
          recipient: t.recipient_name || undefined
        });
      });

      // Fetch deposits
      const { data: deposits } = await supabase
        .from('deposit_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      deposits?.forEach(d => {
        allTransactions.push({
          id: d.id,
          type: 'deposit',
          amount: d.amount,
          status: d.status || 'pending',
          description: `${d.method} deposit`,
          created_at: d.created_at || new Date().toISOString(),
          reference: d.reference_number || d.id.slice(0, 8),
          method: d.method
        });
      });

      // Fetch withdrawals
      const { data: withdrawals } = await supabase
        .from('withdraw_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      withdrawals?.forEach(w => {
        allTransactions.push({
          id: w.id,
          type: 'withdrawal',
          amount: w.amount,
          status: w.status || 'pending',
          description: `${w.method} withdrawal to ${w.destination}`,
          created_at: w.created_at || new Date().toISOString(),
          reference: w.reference_number || w.id.slice(0, 8),
          method: w.method
        });
      });

      // Fetch wire transfers
      const { data: wires } = await supabase
        .from('wire_transfers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      wires?.forEach(w => {
        allTransactions.push({
          id: w.id,
          type: 'wire',
          amount: w.amount,
          status: w.status || 'pending',
          description: `Wire to ${w.recipient_name} at ${w.recipient_bank}`,
          created_at: w.created_at || new Date().toISOString(),
          reference: w.reference_number || w.id.slice(0, 8),
          recipient: w.recipient_name
        });
      });

      // Fetch ACH transfers
      const { data: ach } = await supabase
        .from('ach_transfers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      ach?.forEach(a => {
        allTransactions.push({
          id: a.id,
          type: 'ach',
          amount: a.amount,
          status: a.status || 'pending',
          description: `ACH ${a.transfer_direction} - ${a.description || 'transfer'}`,
          created_at: a.created_at || new Date().toISOString(),
          reference: a.reference_number || a.id.slice(0, 8),
          method: a.ach_type || 'standard'
        });
      });

      // Fetch check deposits
      const { data: checks } = await supabase
        .from('check_deposits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      checks?.forEach(c => {
        allTransactions.push({
          id: c.id,
          type: 'check',
          amount: c.amount,
          status: c.status || 'pending',
          description: `Check deposit from ${c.payer_name || 'unknown'}`,
          created_at: c.created_at || new Date().toISOString(),
          reference: c.check_number || c.id.slice(0, 8)
        });
      });

      // Sort by date
      allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference?.includes(searchTerm) ||
        t.id.includes(searchTerm)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    if (dateFrom) {
      filtered = filtered.filter(t => new Date(t.created_at) >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(t => new Date(t.created_at) <= dateTo);
    }

    setFilteredTransactions(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Status', 'Description', 'Reference'];
    const rows = filteredTransactions.map(t => [
      format(new Date(t.created_at), 'yyyy-MM-dd HH:mm'),
      t.type,
      t.amount.toFixed(2),
      t.status || 'pending',
      t.description || '',
      t.reference || t.id.slice(0, 8)
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `heritage-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Your transactions have been exported to CSV",
    });
  };

  const exportToPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Heritage Bank - Transaction History</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1e3a5f; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1e3a5f; color: white; }
            .credit { color: green; }
            .debit { color: red; }
          </style>
        </head>
        <body>
          <h1>Heritage Bank - Transaction History</h1>
          <p>Generated: ${format(new Date(), 'PPpp')}</p>
          <table>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Description</th>
            </tr>
            ${filteredTransactions.map(t => `
              <tr>
                <td>${format(new Date(t.created_at), 'PPp')}</td>
                <td>${t.type}</td>
                <td class="${['deposit', 'check'].includes(t.type) ? 'credit' : 'debit'}">$${t.amount.toFixed(2)}</td>
                <td>${t.status || 'pending'}</td>
                <td>${t.description || '-'}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }

    toast({
      title: "Print Ready",
      description: "Your transaction report is ready to print",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Pending</Badge>;
      case 'pending_approval':
        return <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">Awaiting Approval</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
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
      default: return <ArrowUpRight className="w-4 h-4 text-foreground" />;
    }
  };

  // Calculate totals
  const totalDeposits = transactions
    .filter(t => ['deposit', 'check'].includes(t.type) && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalTransfers = transactions
    .filter(t => ['transfer', 'wire', 'ach'].includes(t.type) && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingCount = transactions.filter(t => t.status === 'pending' || t.status === 'pending_approval').length;

  if (loading) {
    return <HeritageLoadingScreen message="Loading transaction history..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <BankingHeader activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Transaction History</h1>
              <p className="text-muted-foreground">View all deposits, withdrawals, transfers, and more</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={fetchAllTransactions} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button onClick={exportToPDF} variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <ArrowDownCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Deposits</p>
                    <p className="text-xl font-bold">${totalDeposits.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Withdrawals</p>
                    <p className="text-xl font-bold">${totalWithdrawals.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transfers</p>
                    <p className="text-xl font-bold">${totalTransfers.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-xl font-bold">{pendingCount} transactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Transaction Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="transfer">Internal Transfer</SelectItem>
                    <SelectItem value="deposit">Deposits</SelectItem>
                    <SelectItem value="withdrawal">Withdrawals</SelectItem>
                    <SelectItem value="wire">Wire Transfers</SelectItem>
                    <SelectItem value="ach">ACH Transfers</SelectItem>
                    <SelectItem value="check">Check Deposits</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="pending_approval">Awaiting Approval</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, 'PP') : 'From Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, 'PP') : 'To Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={`${transaction.type}-${transaction.id}`} className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(transaction.created_at), 'HH:mm')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(transaction.type)}
                            <span className="capitalize">{transaction.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {transaction.description || '-'}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {transaction.reference?.toUpperCase()}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${
                          ['deposit', 'check'].includes(transaction.type) ? 'text-green-500' : 'text-foreground'
                        }`}>
                          {['deposit', 'check'].includes(transaction.type) ? '+' : '-'}
                          ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}