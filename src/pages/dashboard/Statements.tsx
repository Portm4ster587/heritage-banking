import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Calendar,
  ArrowLeft,
  Loader2,
  CheckCircle,
  DollarSign,
  FileSpreadsheet,
  Building2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
}

interface StatementData {
  month: string;
  year: number;
  openingBalance: number;
  closingBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  transactionCount: number;
  generated: boolean;
}

interface TaxDocument {
  id: string;
  type: string;
  year: number;
  description: string;
  status: 'available' | 'pending';
}

export default function Statements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [statements, setStatements] = useState<StatementData[]>([]);
  const [taxDocuments, setTaxDocuments] = useState<TaxDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAccounts();
      generateTaxDocuments();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAccount) {
      generateStatements();
    }
  }, [selectedAccount]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active');

      if (error) throw error;
      setAccounts(data || []);
      if (data && data.length > 0) {
        setSelectedAccount(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateStatements = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const generatedStatements: StatementData[] = [];
    
    // Generate last 12 months of statements
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      
      generatedStatements.push({
        month: months[monthIndex],
        year,
        openingBalance: Math.floor(Math.random() * 50000) + 10000,
        closingBalance: Math.floor(Math.random() * 60000) + 15000,
        totalDeposits: Math.floor(Math.random() * 20000) + 5000,
        totalWithdrawals: Math.floor(Math.random() * 15000) + 2000,
        transactionCount: Math.floor(Math.random() * 50) + 10,
        generated: true
      });
    }
    
    setStatements(generatedStatements);
  };

  const generateTaxDocuments = () => {
    const currentYear = new Date().getFullYear();
    const docs: TaxDocument[] = [
      {
        id: '1',
        type: '1099-INT',
        year: currentYear - 1,
        description: 'Interest Income Statement',
        status: 'available'
      },
      {
        id: '2',
        type: '1099-DIV',
        year: currentYear - 1,
        description: 'Dividend Income Statement',
        status: 'available'
      },
      {
        id: '3',
        type: '1099-B',
        year: currentYear - 1,
        description: 'Proceeds from Broker Transactions',
        status: 'available'
      },
      {
        id: '4',
        type: 'Year-End Summary',
        year: currentYear - 1,
        description: 'Annual Account Summary',
        status: 'available'
      },
      {
        id: '5',
        type: '1099-INT',
        year: currentYear,
        description: 'Interest Income Statement (Current Year)',
        status: 'pending'
      }
    ];
    setTaxDocuments(docs);
  };

  const generatePDFContent = (statement: StatementData, account: Account | undefined) => {
    return `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 1500
>>
stream
BT
/F1 24 Tf
50 742 Td
(Heritage International Holdings Bank) Tj
/F1 12 Tf
0 -30 Td
(Monthly Account Statement) Tj
0 -20 Td
(${statement.month} ${statement.year}) Tj
0 -40 Td
(Account: ${account?.account_number || 'N/A'}) Tj
0 -15 Td
(Account Type: ${account?.account_type || 'N/A'}) Tj
0 -40 Td
(Statement Summary) Tj
0 -20 Td
(Opening Balance: $${statement.openingBalance.toLocaleString()}) Tj
0 -15 Td
(Closing Balance: $${statement.closingBalance.toLocaleString()}) Tj
0 -15 Td
(Total Deposits: $${statement.totalDeposits.toLocaleString()}) Tj
0 -15 Td
(Total Withdrawals: $${statement.totalWithdrawals.toLocaleString()}) Tj
0 -15 Td
(Transaction Count: ${statement.transactionCount}) Tj
0 -40 Td
(This statement is generated electronically and is valid without signature.) Tj
0 -20 Td
(Heritage International Holdings Bank - Member FDIC) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000270 00000 n 
0000001820 00000 n 

trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
1897
%%EOF
    `.trim();
  };

  const handleDownloadStatement = async (statement: StatementData) => {
    const key = `${statement.month}-${statement.year}`;
    setDownloading(key);
    
    try {
      const account = accounts.find(a => a.id === selectedAccount);
      const pdfContent = generatePDFContent(statement, account);
      
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Heritage_Statement_${statement.month}_${statement.year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Statement Downloaded',
        description: `${statement.month} ${statement.year} statement has been downloaded.`
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Unable to download statement. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadTaxDoc = async (doc: TaxDocument) => {
    if (doc.status === 'pending') {
      toast({
        title: 'Document Not Ready',
        description: 'This tax document is still being prepared and will be available soon.',
        variant: 'destructive'
      });
      return;
    }

    setDownloading(doc.id);
    
    try {
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pdfContent = `
%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj
4 0 obj << /Length 200 >>
stream
BT /F1 24 Tf 50 742 Td (Heritage International Holdings Bank) Tj
/F1 16 Tf 0 -40 Td (Tax Document: ${doc.type}) Tj
/F1 12 Tf 0 -30 Td (Tax Year: ${doc.year}) Tj
0 -20 Td (${doc.description}) Tj ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref 0 6 trailer << /Size 6 /Root 1 0 R >> startxref 500 %%EOF
      `.trim();
      
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Heritage_${doc.type}_${doc.year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Tax Document Downloaded',
        description: `${doc.type} for ${doc.year} has been downloaded.`
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Unable to download tax document. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setDownloading(null);
    }
  };

  const formatAccountType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Statements & Documents</h1>
            <p className="text-muted-foreground">Download monthly statements and tax documents</p>
          </div>
        </div>

        <Tabs defaultValue="statements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="statements" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Monthly Statements
            </TabsTrigger>
            <TabsTrigger value="tax" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Tax Documents
            </TabsTrigger>
          </TabsList>

          {/* Monthly Statements */}
          <TabsContent value="statements" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Monthly Statements
                    </CardTitle>
                    <CardDescription>
                      Download PDF statements for your accounts
                    </CardDescription>
                  </div>
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {formatAccountType(account.account_type)} - ...{account.account_number.slice(-4)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {statements.map((statement, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{statement.month} {statement.year}</h4>
                            <p className="text-sm text-muted-foreground">
                              {statement.transactionCount} transactions
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-green-600">
                              +${statement.totalDeposits.toLocaleString()}
                            </p>
                            <p className="text-sm text-red-500">
                              -${statement.totalWithdrawals.toLocaleString()}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadStatement(statement)}
                            disabled={downloading === `${statement.month}-${statement.year}`}
                          >
                            {downloading === `${statement.month}-${statement.year}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                PDF
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Documents */}
          <TabsContent value="tax" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Tax Documents
                </CardTitle>
                <CardDescription>
                  Download tax forms and year-end summaries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {taxDocuments.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{doc.type}</h4>
                            <Badge variant={doc.status === 'available' ? 'default' : 'secondary'}>
                              {doc.status === 'available' ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Available
                                </span>
                              ) : (
                                'Pending'
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {doc.description} - {doc.year}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadTaxDoc(doc)}
                        disabled={doc.status === 'pending' || downloading === doc.id}
                      >
                        {downloading === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Tax Document Notice
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Tax documents for the current year will be available by January 31st of the following year. 
                    For questions about your tax documents, please contact our support team.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
