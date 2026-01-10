import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Mail, Calendar, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, Building, Bitcoin, DollarSign, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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

interface StatementPeriod {
  id: string;
  startDate: string;
  endDate: string;
  accountType: string;
  openingBalance: number;
  closingBalance: number;
  totalCredits: number;
  totalDebits: number;
  transactionCount: number;
}

// Generate comprehensive real estate investment and Coincube history from 2020
const generateInvestmentHistory = (): Transaction[] => {
  const transactions: Transaction[] = [];
  let balance = 150000; // Starting balance in 2020
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
    'Boston Heritage District Property'
  ];
  
  const cryptoAssets = ['BTC', 'ETH', 'SOL', 'USDC', 'LINK', 'AVAX', 'DOT', 'ADA'];
  
  const investmentTypes = [
    { type: 'credit', prefix: 'Dividend Payment -', category: 'Real Estate Dividend' },
    { type: 'credit', prefix: 'Rental Income -', category: 'Rental Income' },
    { type: 'credit', prefix: 'Property Sale Profit -', category: 'Capital Gains' },
    { type: 'credit', prefix: 'Quarterly Distribution -', category: 'Investment Distribution' },
    { type: 'credit', prefix: 'Coincube Profit -', category: 'Crypto Gains' },
    { type: 'credit', prefix: 'Interest Payment -', category: 'Interest Income' },
    { type: 'credit', prefix: 'Tax Refund -', category: 'Tax' },
    { type: 'debit', prefix: 'Property Tax -', category: 'Tax Payment' },
    { type: 'debit', prefix: 'Management Fee -', category: 'Management Fee' },
    { type: 'debit', prefix: 'Maintenance Reserve -', category: 'Maintenance' },
    { type: 'debit', prefix: 'Investment Purchase -', category: 'Investment' },
    { type: 'debit', prefix: 'Federal Tax Payment -', category: 'Tax Payment' },
    { type: 'debit', prefix: 'State Tax Payment -', category: 'Tax Payment' },
    { type: 'debit', prefix: 'Insurance Premium -', category: 'Insurance' },
    { type: 'credit', prefix: 'ACFCU Transfer In -', category: 'Bank Transfer' },
    { type: 'debit', prefix: 'Wire to Heritage -', category: 'Wire Transfer' },
    { type: 'credit', prefix: 'Coincube BTC Deposit -', category: 'Crypto Deposit' },
    { type: 'credit', prefix: 'Coincube ETH Profit -', category: 'Crypto Gains' },
    { type: 'credit', prefix: 'Real Estate Trust Dist -', category: 'Trust Distribution' },
    { type: 'credit', prefix: '1031 Exchange Credit -', category: 'Tax Deferred' },
  ];

  // Generate transactions from 2020 to present
  const startDate = new Date('2020-01-05');
  const endDate = new Date();
  
  while (startDate <= endDate && transactions.length < 250) {
    // Generate 2-5 transactions per month
    const monthTransactions = 2 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < monthTransactions && transactions.length < 250; i++) {
      const investment = investmentTypes[Math.floor(Math.random() * investmentTypes.length)];
      const property = realEstateProperties[Math.floor(Math.random() * realEstateProperties.length)];
      const crypto = cryptoAssets[Math.floor(Math.random() * cryptoAssets.length)];
      
      let description = investment.prefix;
      let amount: number;
      
      if (investment.category.includes('Crypto')) {
        description += ` ${crypto} Portfolio`;
        amount = investment.type === 'credit' 
          ? Math.floor(Math.random() * 50000) + 5000 
          : -(Math.floor(Math.random() * 20000) + 2000);
      } else if (investment.category.includes('Real Estate') || investment.category.includes('Rental')) {
        description += ` ${property}`;
        amount = investment.type === 'credit' 
          ? Math.floor(Math.random() * 75000) + 10000 
          : -(Math.floor(Math.random() * 25000) + 5000);
      } else if (investment.category.includes('Tax')) {
        description += ` Q${Math.floor(Math.random() * 4) + 1} ${startDate.getFullYear()}`;
        amount = investment.type === 'credit' 
          ? Math.floor(Math.random() * 15000) + 2000 
          : -(Math.floor(Math.random() * 35000) + 8000);
      } else if (investment.category.includes('Transfer')) {
        description += ` Heritage Investments`;
        amount = investment.type === 'credit' 
          ? Math.floor(Math.random() * 100000) + 25000 
          : -(Math.floor(Math.random() * 50000) + 10000);
      } else {
        description += ` ${property}`;
        amount = investment.type === 'credit' 
          ? Math.floor(Math.random() * 40000) + 5000 
          : -(Math.floor(Math.random() * 15000) + 2000);
      }
      
      balance += amount;
      
      // Add some random days within the month
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
        balance: Math.max(balance, 50000),
        reference: `HIH${startDate.getFullYear()}${String(id).padStart(6, '0')}`
      });
    }
    
    // Move to next month
    startDate.setMonth(startDate.getMonth() + 1);
  }
  
  // Sort by date descending
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Generate statement periods from 2020
const generateStatementPeriods = (): StatementPeriod[] => {
  const periods: StatementPeriod[] = [];
  const now = new Date();
  const startYear = 2020;
  
  for (let year = now.getFullYear(); year >= startYear; year--) {
    const maxMonth = year === now.getFullYear() ? now.getMonth() + 1 : 12;
    
    for (let month = maxMonth; month >= 1; month--) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const baseBalance = 500000 + (year - 2020) * 200000 + month * 15000;
      const credits = Math.floor(Math.random() * 150000) + 50000;
      const debits = Math.floor(Math.random() * 80000) + 20000;
      
      periods.push({
        id: `${year}-${String(month).padStart(2, '0')}`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        accountType: 'Heritage Investment Holdings',
        openingBalance: baseBalance - credits + debits,
        closingBalance: baseBalance,
        totalCredits: credits,
        totalDebits: -debits,
        transactionCount: 8 + Math.floor(Math.random() * 12)
      });
    }
  }
  
  return periods;
};

export const AccountStatements = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('investment');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statementPeriods, setStatementPeriods] = useState<StatementPeriod[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const periods = generateStatementPeriods();
    const txns = generateInvestmentHistory();
    setStatementPeriods(periods);
    setTransactions(txns);
    if (periods.length > 0) {
      setSelectedPeriod(periods[0].id);
    }
    
    // Fetch user accounts
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    try {
      const { data } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id);
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const currentStatement = statementPeriods.find(p => p.id === selectedPeriod);
  
  // Filter transactions for selected period
  const filteredTransactions = transactions.filter(t => {
    if (!currentStatement) return true;
    const txDate = new Date(t.date);
    return txDate >= new Date(currentStatement.startDate) && txDate <= new Date(currentStatement.endDate);
  }).slice(0, 25);

  const handleDownloadStatement = async (format: 'pdf' | 'csv' | 'excel') => {
    setIsGenerating(true);
    
    toast({
      title: "Generating Statement",
      description: `Preparing your ${format.toUpperCase()} statement...`,
    });

    setTimeout(() => {
      const header = 'Date,Description,Amount,Type,Category,Balance,Reference\n';
      const statementData = filteredTransactions.map(t => 
        `${t.date},"${t.description}",${t.type === 'credit' ? '+' : '-'}${t.amount},${t.type},${t.category},${t.balance},${t.reference}`
      ).join('\n');
      
      const csvContent = header + statementData;
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `heritage-investment-statement-${selectedPeriod}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Statement Downloaded",
        description: `Your ${format.toUpperCase()} investment statement has been downloaded.`,
      });
      setIsGenerating(false);
    }, 1500);
  };

  const handleEmailStatement = () => {
    toast({
      title: "Statement Sent",
      description: `Investment statement has been sent to ${user?.email}`,
    });
  };

  const handleCustomStatement = () => {
    if (!dateFrom || !dateTo) {
      toast({
        title: "Date Range Required",
        description: "Please select both start and end dates",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      toast({
        title: "Custom Statement Generated",
        description: `Investment statement for ${dateFrom} to ${dateTo} is ready.`,
      });
      setIsGenerating(false);
    }, 2000);
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Real Estate') || category.includes('Rental')) return <Building className="w-4 h-4" />;
    if (category.includes('Crypto')) return <Bitcoin className="w-4 h-4" />;
    if (category.includes('Tax')) return <Percent className="w-4 h-4" />;
    if (category.includes('Interest') || category.includes('Dividend')) return <TrendingUp className="w-4 h-4" />;
    return <DollarSign className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="animate-slide-up">
        <h2 className="text-3xl font-bold text-primary mb-2">Investment Statements</h2>
        <p className="text-muted-foreground">Real estate holdings, Coincube crypto, and investment transaction history since 2020</p>
      </div>

      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="view">View Statements</TabsTrigger>
          <TabsTrigger value="download">Download</TabsTrigger>
          <TabsTrigger value="custom">Custom Period</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-6">
          <Card className="banking-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-6 w-6 text-primary" />
                <span>Select Account & Period</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account</Label>
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investment">Heritage Investment Holdings</SelectItem>
                      <SelectItem value="realestate">Real Estate Portfolio</SelectItem>
                      <SelectItem value="crypto">Coincube Crypto Assets</SelectItem>
                      {accounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.account_type} (...{acc.account_number?.slice(-4)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Statement Period (2020 - Present)</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {statementPeriods.slice(0, 60).map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          {new Date(period.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {currentStatement && (
            <Card className="banking-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                  <span>Investment Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
                    <p className="text-sm text-muted-foreground mb-1">Opening Balance</p>
                    <p className="text-2xl font-bold text-primary">
                      ${currentStatement.openingBalance.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20">
                    <p className="text-sm text-muted-foreground mb-1">Closing Balance</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${currentStatement.closingBalance.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20">
                    <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">
                      +${currentStatement.totalCredits.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20">
                    <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                    <p className="text-2xl font-bold text-destructive">
                      ${currentStatement.totalDebits.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Statement Period</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(currentStatement.startDate).toLocaleDateString()} - {new Date(currentStatement.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Transactions</p>
                      <p className="text-sm text-muted-foreground">{currentStatement.transactionCount} total</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="banking-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-accent" />
                <span>Investment Transaction History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${transaction.type === 'credit' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {transaction.type === 'credit' ? (
                          <ArrowDownRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm md:text-base">{transaction.description}</p>
                        <div className="flex items-center gap-2 flex-wrap text-xs md:text-sm text-muted-foreground">
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            {getCategoryIcon(transaction.category)}
                            {transaction.category}
                          </Badge>
                          <span className="hidden md:inline">Ref: {transaction.reference}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Bal: ${transaction.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Showing {filteredTransactions.length} of {transactions.length} total transactions
                </p>
                <Button variant="outline" onClick={() => handleDownloadStatement('csv')}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Full History
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="download" className="space-y-6">
          <Card className="banking-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-6 w-6 text-primary" />
                <span>Download Investment Statements</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="text-center space-y-3">
                    <FileText className="h-12 w-12 mx-auto text-red-600 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className="font-medium">PDF Statement</h3>
                      <p className="text-sm text-muted-foreground">Complete investment report</p>
                    </div>
                    <Button 
                      onClick={() => handleDownloadStatement('pdf')}
                      disabled={isGenerating}
                      className="w-full"
                      variant="outline"
                    >
                      Download PDF
                    </Button>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="text-center space-y-3">
                    <FileText className="h-12 w-12 mx-auto text-green-600 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className="font-medium">Excel Spreadsheet</h3>
                      <p className="text-sm text-muted-foreground">Tax-ready format</p>
                    </div>
                    <Button 
                      onClick={() => handleDownloadStatement('excel')}
                      disabled={isGenerating}
                      className="w-full"
                      variant="outline"
                    >
                      Download Excel
                    </Button>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="text-center space-y-3">
                    <FileText className="h-12 w-12 mx-auto text-blue-600 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className="font-medium">CSV File</h3>
                      <p className="text-sm text-muted-foreground">Raw transaction data</p>
                    </div>
                    <Button 
                      onClick={() => handleDownloadStatement('csv')}
                      disabled={isGenerating}
                      className="w-full"
                      variant="outline"
                    >
                      Download CSV
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Email Statement</p>
                      <p className="text-sm text-muted-foreground">Send to {user?.email}</p>
                    </div>
                  </div>
                  <Button onClick={handleEmailStatement} variant="outline">
                    Send Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card className="banking-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-accent" />
                <span>Custom Date Range (2020 - Present)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date-from">From Date</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    min="2020-01-01"
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-to">To Date</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investment">All Investment Holdings</SelectItem>
                    <SelectItem value="realestate">Real Estate Only</SelectItem>
                    <SelectItem value="crypto">Coincube Crypto Only</SelectItem>
                    <SelectItem value="dividends">Dividends & Interest</SelectItem>
                    <SelectItem value="tax">Tax Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleCustomStatement}
                disabled={isGenerating}
                className="w-full banking-button"
              >
                {isGenerating ? "Generating..." : "Generate Custom Statement"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
