import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building, 
  Bitcoin, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  balance: number;
  reference: string;
}

// Generate comprehensive real estate investment and Coincube history from 2020
const generateInvestmentHistory = (): Transaction[] => {
  const transactions: Transaction[] = [];
  let balance = 150000;
  let id = 1;
  
  const realEstateProperties = [
    'Manhattan Commercial Tower Unit 12A',
    'Brooklyn Heights Residential Complex',
    'Miami Beach Luxury Condominiums',
    'Los Angeles Downtown Office Space',
    'Chicago Lakeshore Properties',
    'San Francisco Tech Hub Building',
    'Austin Mixed-Use Development',
    'Denver Mountain View Apartments',
    'Seattle Waterfront Commercial',
    'Boston Heritage District Property',
    'Houston Energy Corridor Office',
    'Phoenix Desert Ridge Estates',
    'Las Vegas Strip Commercial',
    'Atlanta Midtown Tower'
  ];
  
  const cryptoAssets = ['BTC', 'ETH', 'SOL', 'USDC', 'LINK', 'AVAX', 'DOT', 'ADA', 'XRP', 'MATIC'];
  
  const investmentTypes = [
    { type: 'credit', prefix: 'Dividend Payment -', category: 'Real Estate Dividend' },
    { type: 'credit', prefix: 'Rental Income -', category: 'Rental Income' },
    { type: 'credit', prefix: 'Property Sale Profit -', category: 'Capital Gains' },
    { type: 'credit', prefix: 'Quarterly Distribution -', category: 'Investment Distribution' },
    { type: 'credit', prefix: 'Coincube Profit -', category: 'Crypto Gains' },
    { type: 'credit', prefix: 'Coincube Staking Rewards -', category: 'Crypto Staking' },
    { type: 'credit', prefix: 'Interest Payment -', category: 'Interest Income' },
    { type: 'credit', prefix: 'Tax Refund -', category: 'Tax Refund' },
    { type: 'debit', prefix: 'Property Tax -', category: 'Property Tax' },
    { type: 'debit', prefix: 'Management Fee -', category: 'Management Fee' },
    { type: 'debit', prefix: 'Maintenance Reserve -', category: 'Maintenance' },
    { type: 'debit', prefix: 'Investment Purchase -', category: 'Investment' },
    { type: 'debit', prefix: 'Federal Tax Payment -', category: 'Federal Tax' },
    { type: 'debit', prefix: 'State Tax Payment -', category: 'State Tax' },
    { type: 'debit', prefix: 'Insurance Premium -', category: 'Insurance' },
    { type: 'credit', prefix: 'ACFCU Transfer In -', category: 'Bank Transfer' },
    { type: 'credit', prefix: 'Heritage Wire Credit -', category: 'Wire Transfer' },
    { type: 'debit', prefix: 'Wire to Heritage -', category: 'Wire Transfer' },
    { type: 'credit', prefix: 'Coincube BTC Deposit -', category: 'Crypto Deposit' },
    { type: 'credit', prefix: 'Coincube ETH Profit -', category: 'Crypto Gains' },
    { type: 'credit', prefix: 'Real Estate Trust Dist -', category: 'Trust Distribution' },
    { type: 'credit', prefix: '1031 Exchange Credit -', category: 'Tax Deferred Exchange' },
    { type: 'debit', prefix: 'Escrow Payment -', category: 'Escrow' },
    { type: 'credit', prefix: 'HOA Refund -', category: 'HOA' },
    { type: 'debit', prefix: 'Capital Call -', category: 'Investment' },
    { type: 'credit', prefix: 'Refinance Proceeds -', category: 'Refinance' },
    { type: 'debit', prefix: 'Closing Costs -', category: 'Closing Costs' },
    { type: 'credit', prefix: 'Appreciation Sale -', category: 'Capital Gains' },
  ];

  const startDate = new Date('2020-01-05');
  const endDate = new Date();
  
  while (startDate <= endDate && transactions.length < 300) {
    const monthTransactions = 3 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < monthTransactions && transactions.length < 300; i++) {
      const investment = investmentTypes[Math.floor(Math.random() * investmentTypes.length)];
      const property = realEstateProperties[Math.floor(Math.random() * realEstateProperties.length)];
      const crypto = cryptoAssets[Math.floor(Math.random() * cryptoAssets.length)];
      
      let description = investment.prefix;
      let amount: number;
      
      if (investment.category.includes('Crypto')) {
        description += ` ${crypto} Portfolio`;
        amount = investment.type === 'credit' 
          ? Math.floor(Math.random() * 80000) + 5000 
          : -(Math.floor(Math.random() * 30000) + 2000);
      } else if (investment.category.includes('Real Estate') || investment.category.includes('Rental') || investment.category.includes('Property')) {
        description += ` ${property}`;
        amount = investment.type === 'credit' 
          ? Math.floor(Math.random() * 120000) + 15000 
          : -(Math.floor(Math.random() * 45000) + 8000);
      } else if (investment.category.includes('Tax')) {
        description += ` Q${Math.floor(Math.random() * 4) + 1} ${startDate.getFullYear()}`;
        amount = investment.type === 'credit' 
          ? Math.floor(Math.random() * 25000) + 3000 
          : -(Math.floor(Math.random() * 55000) + 12000);
      } else if (investment.category.includes('Transfer') || investment.category.includes('Wire')) {
        description += ` Heritage Investments`;
        amount = investment.type === 'credit' 
          ? Math.floor(Math.random() * 200000) + 50000 
          : -(Math.floor(Math.random() * 100000) + 20000);
      } else if (investment.category.includes('Capital Gains')) {
        description += ` ${property}`;
        amount = Math.floor(Math.random() * 500000) + 100000;
      } else {
        description += ` ${property}`;
        amount = investment.type === 'credit' 
          ? Math.floor(Math.random() * 60000) + 8000 
          : -(Math.floor(Math.random() * 25000) + 3000);
      }
      
      balance += amount;
      
      const dayOffset = Math.floor(Math.random() * 25) + 1;
      const transactionDate = new Date(startDate);
      transactionDate.setDate(dayOffset);
      
      transactions.push({
        id: String(id++),
        date: transactionDate.toISOString().split('T')[0],
        description,
        amount: Math.abs(amount),
        type: amount > 0 ? 'credit' : 'debit',
        category: investment.category,
        balance: Math.max(balance, 100000),
        reference: `HIH${startDate.getFullYear()}${String(id).padStart(6, '0')}`
      });
    }
    
    startDate.setMonth(startDate.getMonth() + 1);
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const RealTimeInvestmentHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const categories = [
    'all',
    'Real Estate Dividend',
    'Rental Income',
    'Capital Gains',
    'Crypto Gains',
    'Crypto Staking',
    'Property Tax',
    'Federal Tax',
    'State Tax',
    'Bank Transfer',
    'Wire Transfer',
    'Investment'
  ];

  useEffect(() => {
    loadTransactions();

    // Real-time subscription for transfers
    const channel = supabase
      .channel('investment-history-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transfers', filter: `user_id=eq.${user?.id}` },
        (payload) => {
          console.log('Real-time transfer update:', payload);
          loadTransactions();
          setLastUpdate(new Date());
          toast({
            title: "Transaction Updated",
            description: "Your transaction history has been updated in real-time.",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, categoryFilter, typeFilter]);

  const loadTransactions = async () => {
    setLoading(true);
    
    // Generate investment history
    const investmentHistory = generateInvestmentHistory();
    
    // Also fetch real transfers from database
    if (user) {
      try {
        const { data: realTransfers } = await supabase
          .from('transfers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (realTransfers && realTransfers.length > 0) {
          const mappedTransfers: Transaction[] = realTransfers.map((t, idx) => ({
            id: `real-${t.id}`,
            date: new Date(t.created_at).toISOString().split('T')[0],
            description: t.description || `${t.transfer_type} Transfer`,
            amount: t.amount,
            type: t.transfer_type.includes('credit') || t.transfer_type === 'internal' ? 'credit' : 'debit',
            category: t.transfer_type === 'wire' ? 'Wire Transfer' : t.transfer_type === 'internal' ? 'Bank Transfer' : 'Investment',
            balance: 0,
            reference: `TXN${t.id.slice(0, 8).toUpperCase()}`
          }));

          setTransactions([...mappedTransfers, ...investmentHistory]);
        } else {
          setTransactions(investmentHistory);
        }
      } catch (error) {
        console.error('Error fetching transfers:', error);
        setTransactions(investmentHistory);
      }
    } else {
      setTransactions(investmentHistory);
    }
    
    setLoading(false);
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    setFilteredTransactions(filtered);
  };

  const handleExport = () => {
    const header = 'Date,Description,Amount,Type,Category,Reference\n';
    const csvData = filteredTransactions.map(t => 
      `${t.date},"${t.description}",${t.type === 'credit' ? '+' : '-'}${t.amount},${t.type},${t.category},${t.reference}`
    ).join('\n');
    
    const blob = new Blob([header + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `heritage-investment-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Exported", description: "Transaction history exported successfully" });
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Real Estate') || category.includes('Rental') || category.includes('Property')) return <Building className="w-4 h-4" />;
    if (category.includes('Crypto')) return <Bitcoin className="w-4 h-4" />;
    if (category.includes('Tax')) return <Percent className="w-4 h-4" />;
    if (category.includes('Interest') || category.includes('Dividend')) return <TrendingUp className="w-4 h-4" />;
    return <DollarSign className="w-4 h-4" />;
  };

  const totalCredits = filteredTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = filteredTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <Card className="banking-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Real-Time Investment History
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="w-4 h-4" />
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-green-600">+${totalCredits.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">-${totalDebits.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-muted-foreground">Net Change</p>
              <p className="text-2xl font-bold text-primary">${(totalCredits - totalDebits).toLocaleString()}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Income</SelectItem>
                <SelectItem value="debit">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Transaction Table */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Loading transactions...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.slice(0, 50).map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-full ${transaction.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {transaction.type === 'credit' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          </div>
                          <span className="truncate">{transaction.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {getCategoryIcon(transaction.category)}
                          {transaction.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {transaction.reference}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length > 50 && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Showing 50 of {filteredTransactions.length} transactions
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
