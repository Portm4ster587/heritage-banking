import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Mail, Calendar, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'Direct Deposit - Salary',
    amount: 5000.00,
    type: 'credit',
    category: 'Income',
    balance: 67899.00,
    reference: 'REF001'
  },
  {
    id: '2',
    date: '2024-01-14',
    description: 'ACH Transfer to Business Account',
    amount: -2500.00,
    type: 'debit', 
    category: 'Transfer',
    balance: 62899.00,
    reference: 'REF002'
  },
  {
    id: '3',
    date: '2024-01-13',
    description: 'Online Purchase - Amazon',
    amount: -156.78,
    type: 'debit',
    category: 'Shopping',
    balance: 65399.00,
    reference: 'REF003'
  },
  {
    id: '4',
    date: '2024-01-12',
    description: 'Interest Payment',
    amount: 45.50,
    type: 'credit',
    category: 'Interest',
    balance: 65555.78,
    reference: 'REF004'
  },
  {
    id: '5',
    date: '2024-01-11',
    description: 'Grocery Store Purchase',
    amount: -89.32,
    type: 'debit',
    category: 'Food',
    balance: 65510.28,
    reference: 'REF005'
  }
];

const statementPeriods: StatementPeriod[] = [
  {
    id: '2024-01',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    accountType: 'Personal Savings',
    openingBalance: 62450.00,
    closingBalance: 67899.00,
    totalCredits: 8950.00,
    totalDebits: -3501.00,
    transactionCount: 24
  },
  {
    id: '2023-12',
    startDate: '2023-12-01', 
    endDate: '2023-12-31',
    accountType: 'Personal Savings',
    openingBalance: 58200.00,
    closingBalance: 62450.00,
    totalCredits: 7850.00,
    totalDebits: -3600.00,
    transactionCount: 28
  },
  {
    id: '2023-11',
    startDate: '2023-11-01',
    endDate: '2023-11-30', 
    accountType: 'Personal Savings',
    openingBalance: 55100.00,
    closingBalance: 58200.00,
    totalCredits: 6400.00,
    totalDebits: -3300.00,
    transactionCount: 22
  }
];

export const AccountStatements = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2024-01');
  const [selectedAccount, setSelectedAccount] = useState<string>('savings');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const currentStatement = statementPeriods.find(p => p.id === selectedPeriod);

  const handleDownloadStatement = async (format: 'pdf' | 'csv' | 'excel') => {
    setIsGenerating(true);
    
    toast({
      title: "Generating Statement",
      description: `Preparing your ${format.toUpperCase()} statement...`,
    });

    // Simulate statement generation
    setTimeout(() => {
      toast({
        title: "Statement Ready",
        description: `Your ${format.toUpperCase()} statement has been downloaded successfully.`,
      });
      setIsGenerating(false);
    }, 2000);
  };

  const handleEmailStatement = () => {
    toast({
      title: "Statement Sent",
      description: `Statement has been sent to ${user?.email}`,
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
        description: `Statement for ${dateFrom} to ${dateTo} is ready for download.`,
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="animate-slide-up">
        <h2 className="text-3xl font-bold text-primary mb-2">Account Statements</h2>
        <p className="text-muted-foreground">View, download, and manage your account statements</p>
      </div>

      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="view">View Statements</TabsTrigger>
          <TabsTrigger value="download">Download</TabsTrigger>
          <TabsTrigger value="custom">Custom Period</TabsTrigger>
        </TabsList>

        {/* View Statements Tab */}
        <TabsContent value="view" className="space-y-6">
          {/* Account Selection */}
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
                      <SelectItem value="savings">Personal Savings (...5678)</SelectItem>
                      <SelectItem value="checking">Personal Checking (...1234)</SelectItem>
                      <SelectItem value="business">Business Savings (...9012)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Statement Period</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statementPeriods.map((period) => (
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

          {/* Statement Summary */}
          {currentStatement && (
            <Card className="banking-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                  <span>Statement Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Opening Balance</p>
                    <p className="text-2xl font-bold text-primary">
                      ${currentStatement.openingBalance.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Closing Balance</p>
                    <p className="text-2xl font-bold text-secondary">
                      ${currentStatement.closingBalance.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Credits</p>
                    <p className="text-2xl font-bold text-success">
                      +${currentStatement.totalCredits.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Debits</p>
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

          {/* Transaction History */}
          <Card className="banking-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-accent" />
                <span>Transaction History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${transaction.type === 'credit' ? 'bg-success/20' : 'bg-destructive/20'}`}>
                        {transaction.type === 'credit' ? (
                          <ArrowDownRight className="h-4 w-4 text-success" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          <Badge variant="outline" className="text-xs">{transaction.category}</Badge>
                          <span>Ref: {transaction.reference}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === 'credit' ? 'text-success' : 'text-destructive'}`}>
                        {transaction.type === 'credit' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Balance: ${transaction.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Download Tab */}
        <TabsContent value="download" className="space-y-6">
          <Card className="banking-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-6 w-6 text-primary" />
                <span>Download Statements</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="text-center space-y-3">
                    <FileText className="h-12 w-12 mx-auto text-red-600 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className="font-medium">PDF Statement</h3>
                      <p className="text-sm text-muted-foreground">Complete formatted statement</p>
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
                      <p className="text-sm text-muted-foreground">Editable data format</p>
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

        {/* Custom Period Tab */}
        <TabsContent value="custom" className="space-y-6">
          <Card className="banking-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-accent" />
                <span>Custom Date Range</span>
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
                <Label>Account</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Personal Savings (...5678)</SelectItem>
                    <SelectItem value="checking">Personal Checking (...1234)</SelectItem>
                    <SelectItem value="business">Business Savings (...9012)</SelectItem>
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