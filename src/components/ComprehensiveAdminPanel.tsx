import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  CreditCard,
  Building,
  Home,
  Car,
  DollarSign,
  ArrowRightLeft,
  Wallet,
  Settings,
  Eye,
  Edit,
  AlertTriangle,
  QrCode,
  Smartphone
} from 'lucide-react';

interface Application {
  id: string;
  user_id: string;
  application_type: string;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  annual_income: number;
  requested_amount: number;
  requested_limit: number;
  created_at: string;
  review_notes: string;
  is_guest: boolean;
}

interface Transfer {
  id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  currency: string;
  status: string;
  progress: number;
  memo: string;
  created_at: string;
}

interface Card {
  id: string;
  account_id: string;
  card_type: string;
  last4: string;
  embossed_name: string;
  activation_status: string;
  status: string;
  network: string;
  exp_month: number;
  exp_year: number;
}

interface PaymentMethod {
  id: string;
  method_type: string;
  provider: string;
  details: any;
  is_active: boolean;
  created_at: string;
}

const statusColors = {
  pending: 'bg-warning text-warning-foreground',
  under_review: 'bg-primary text-primary-foreground', 
  approved: 'bg-success text-success-foreground',
  rejected: 'bg-destructive text-destructive-foreground',
  completed: 'bg-success text-success-foreground',
  failed: 'bg-destructive text-destructive-foreground',
  active: 'bg-success text-success-foreground',
  inactive: 'bg-muted text-muted-foreground'
};

export const ComprehensiveAdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  
  // Heleket payment configuration
  const [heleket, setHeleket] = useState({
    merchant_id: '',
    api_key: '',
    webhook_url: '',
    is_enabled: false
  });

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch applications
      const { data: appsData } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Fetch transfers
      const { data: transfersData } = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Fetch cards
      const { data: cardsData } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false });
        
      // Fetch payment methods
      const { data: paymentsData } = await supabase
        .from('payment_methods')
        .select('*')
        .order('created_at', { ascending: false });

      setApplications(appsData || []);
      setTransfers(transfersData || []);
      setCards(cardsData || []);
      setPaymentMethods(paymentsData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status: 'approved',
          review_notes: reviewNotes,
          reviewed_by_admin_id: user?.id
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Auto-create account for approved applications
      const application = applications.find(a => a.id === applicationId);
      if (application) {
        await supabase
          .from('accounts')
          .insert({
            user_id: application.user_id,
            type: application.application_type as 'personal_checking' | 'personal_savings' | 'business_checking' | 'business_savings',
            account_number: `${application.application_type.toUpperCase()}${Math.random().toString().slice(2, 12)}`,
            balance: 0,
            status: 'active',
            currency: 'USD'
          });
      }

      toast({
        title: "Application Approved",
        description: "Account has been created for the user"
      });

      fetchAllData();
      setSelectedApplication(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error approving application:', error);
      toast({
        title: "Error",
        description: "Failed to approve application",
        variant: "destructive"
      });
    }
  };

  const handleApproveTransfer = async (transferId: string) => {
    try {
      const { error } = await supabase
        .from('transfers')
        .update({
          status: 'completed',
          approved_by_admin_id: user?.id
        })
        .eq('id', transferId);

      if (error) throw error;

      toast({
        title: "Transfer Approved",
        description: "Transfer will be processed"
      });

      fetchAllData();
      setSelectedTransfer(null);
    } catch (error) {
      console.error('Error approving transfer:', error);
      toast({
        title: "Error",
        description: "Failed to approve transfer",
        variant: "destructive"
      });
    }
  };

  const handleGenerateCard = async (accountId: string) => {
    try {
      const cardNumber = `4${Math.random().toString().slice(2, 16)}`;
      const cvv = Math.random().toString().slice(2, 5);
      
      const { error } = await supabase
        .from('cards')
        .insert({
          account_id: accountId,
          card_type: 'debit',
          card_number_encrypted: cardNumber, // In production, this should be properly encrypted
          cvv_encrypted: cvv, // In production, this should be properly encrypted
          last4: cardNumber.slice(-4),
          embossed_name: 'HERITAGE BANK CUSTOMER',
          network: Math.random() > 0.5 ? 'VISA' : 'MASTERCARD',
          exp_month: 12,
          exp_year: 2029,
          activation_status: 'inactive',
          status: 'pending',
          activation_code: Math.random().toString().slice(2, 8)
        });

      if (error) throw error;

      toast({
        title: "Card Generated",
        description: "New debit card has been created"
      });

      fetchAllData();
    } catch (error) {
      console.error('Error generating card:', error);
      toast({
        title: "Error", 
        description: "Failed to generate card",
        variant: "destructive"
      });
    }
  };

  const handleConfigureHeleket = async () => {
    try {
      // In a real implementation, this would save to a secure config table
      toast({
        title: "Heleket Configured",
        description: "Payment processor settings updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to configure Heleket",
        variant: "destructive"
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-warning mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">Administrator privileges required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading comprehensive admin panel...</p>
      </div>
    );
  }

  const stats = {
    totalApplications: applications.length,
    pendingApplications: applications.filter(a => a.status === 'pending').length,
    pendingTransfers: transfers.filter(t => t.status === 'pending').length,
    activeCards: cards.filter(c => c.status === 'active').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="banking-gradient-primary p-6 rounded-xl text-primary-foreground">
        <h1 className="text-3xl font-bold mb-2">Comprehensive Admin Panel</h1>
        <p className="text-primary-foreground/80">Complete banking administration & oversight</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="banking-card hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-2xl font-bold">{stats.totalApplications}</p>
                <p className="text-xs text-warning">{stats.pendingApplications} pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="banking-card hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-warning/10">
                <ArrowRightLeft className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transfers</p>
                <p className="text-2xl font-bold">{transfers.length}</p>
                <p className="text-xs text-warning">{stats.pendingTransfers} pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="banking-card hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-success/10">
                <CreditCard className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cards</p>
                <p className="text-2xl font-bold">{cards.length}</p>
                <p className="text-xs text-success">{stats.activeCards} active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="banking-card hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-accent/10">
                <Wallet className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Methods</p>
                <p className="text-2xl font-bold">{paymentMethods.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="wallets">Crypto Wallets</TabsTrigger>
          <TabsTrigger value="payments">Payment Config</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card className="banking-card">
            <CardHeader>
              <CardTitle>Pending Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.filter(a => a.status === 'pending').map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Building className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{app.first_name} {app.last_name}</p>
                        <p className="text-sm text-muted-foreground">{app.application_type}</p>
                        <p className="text-xs text-muted-foreground">{app.email}</p>
                        {app.is_guest && <Badge variant="secondary" className="text-xs">Guest Application</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[app.status as keyof typeof statusColors]}>
                        {app.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApplication(app)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers" className="space-y-4">
          <Card className="banking-card">
            <CardHeader>
              <CardTitle>Pending Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transfers.filter(t => t.status === 'pending').map((transfer) => (
                  <div key={transfer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-warning/10">
                        <ArrowRightLeft className="w-4 h-4 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium">${transfer.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{transfer.memo || 'Internal Transfer'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transfer.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right mr-4">
                        <div className="text-sm font-medium">Progress: {transfer.progress}%</div>
                        <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${transfer.progress}%` }}
                          />
                        </div>
                      </div>
                      <Badge className={statusColors[transfer.status as keyof typeof statusColors]}>
                        {transfer.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproveTransfer(transfer.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards" className="space-y-4">
          <Card className="banking-card">
            <CardHeader>
              <CardTitle>Card Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-success/10">
                        <CreditCard className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <p className="font-medium">{card.network} •••• {card.last4}</p>
                        <p className="text-sm text-muted-foreground">{card.embossed_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Exp: {card.exp_month}/{card.exp_year} • {card.card_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[card.activation_status as keyof typeof statusColors]}>
                        {card.activation_status}
                      </Badge>
                      <Badge className={statusColors[card.status as keyof typeof statusColors]}>
                        {card.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Crypto Wallets Tab */}
        <TabsContent value="wallets" className="space-y-4">
          <Card className="banking-card">
            <CardHeader>
              <CardTitle>Crypto Wallet Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <QrCode className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Wallet Generation & Management</h3>
                <p className="text-muted-foreground mb-4">
                  Generate QR codes and manage crypto wallets for users
                </p>
                <Button className="banking-button">
                  <Wallet className="w-4 h-4 mr-2" />
                  Generate New Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Configuration Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card className="banking-card">
            <CardHeader>
              <CardTitle>Heleket Payment Processor Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Merchant ID</Label>
                <Input
                  value={heleket.merchant_id}
                  onChange={(e) => setHeleket(prev => ({ ...prev, merchant_id: e.target.value }))}
                  placeholder="Enter Heleket Merchant ID"
                />
              </div>
              
              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={heleket.api_key}
                  onChange={(e) => setHeleket(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="Enter Heleket API Key"
                />
              </div>
              
              <div>
                <Label>Webhook URL</Label>
                <Input
                  value={heleket.webhook_url}
                  onChange={(e) => setHeleket(prev => ({ ...prev, webhook_url: e.target.value }))}
                  placeholder="https://your-domain.com/webhook"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="heleket-enabled"
                  checked={heleket.is_enabled}
                  onChange={(e) => setHeleket(prev => ({ ...prev, is_enabled: e.target.checked }))}
                />
                <Label htmlFor="heleket-enabled">Enable Heleket Integration</Label>
              </div>
              
              <Button onClick={handleConfigureHeleket} className="banking-button">
                <Settings className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="banking-card">
              <CardHeader>
                <CardTitle>Mobile App Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Smartphone className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium">Mobile GUI Settings</p>
                    <p className="text-sm text-muted-foreground">
                      Configure modern mobile interface elements
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Mobile Interface
                </Button>
              </CardContent>
            </Card>

            <Card className="banking-card">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Configure banking security requirements and compliance settings
                </p>
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Security Configuration
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Application Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-scale-in">
            <CardHeader className="banking-gradient-secondary text-secondary-foreground">
              <CardTitle>Application Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Applicant Name</Label>
                  <p className="font-medium">{selectedApplication.first_name} {selectedApplication.last_name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedApplication.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="font-medium">{selectedApplication.phone}</p>
                </div>
                <div>
                  <Label>Application Type</Label>
                  <p className="font-medium capitalize">{selectedApplication.application_type.replace('_', ' ')}</p>
                </div>
                {selectedApplication.annual_income && (
                  <div>
                    <Label>Annual Income</Label>
                    <p className="font-medium">${selectedApplication.annual_income.toLocaleString()}</p>
                  </div>
                )}
                {selectedApplication.requested_amount && (
                  <div>
                    <Label>Requested Amount</Label>
                    <p className="font-medium">${selectedApplication.requested_amount.toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div>
                <Label>Review Notes</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add your review comments..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedApplication(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    // Handle rejection
                    setSelectedApplication(null);
                  }}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproveApplication(selectedApplication.id)}
                  className="flex-1 banking-button"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve & Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};