import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Search,
  Eye,
  Edit,
  AlertTriangle,
  CreditCard,
  Building,
  Home,
  Car,
  DollarSign
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
  address: string;
  city: string;
  state: string;
  zip_code: string;
  ssn_last4: string;
  date_of_birth: string;
  annual_income: number | null;
  monthly_income: number | null;
  employment_status: string | null;
  employer_name: string | null;
  loan_amount: number | null;
  loan_purpose: string | null;
  annual_revenue: number | null;
  business_name: string | null;
  business_type: string | null;
  business_tax_id: string | null;
  years_in_business: number | null;
  created_at: string;
  review_notes: string | null;
  reviewed_by_admin_id: string | null;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
}

const statusColors = {
  pending: 'bg-warning text-warning-foreground',
  under_review: 'bg-primary text-primary-foreground', 
  approved: 'bg-success text-success-foreground',
  rejected: 'bg-destructive text-destructive-foreground',
  additional_info_required: 'bg-accent text-accent-foreground',
};

const applicationTypeIcons = {
  checking: Users,
  savings: DollarSign,
  business: Building,
  credit_card: CreditCard,
  personal_loan: FileText,
  home_loan: Home,
  auto_loan: Car,
  business_loan: Building,
};

const applicationTypeLabels = {
  checking: 'Checking Account',
  savings: 'Savings Account', 
  business: 'Business Account',
  credit_card: 'Credit Card',
  personal_loan: 'Personal Loan',
  home_loan: 'Home Loan',
  auto_loan: 'Auto Loan',
  business_loan: 'Business Loan',
};

export const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchApplications();
      fetchUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, typeFilter]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive"
      });
    }
  };

  const fetchUsers = async () => {
    try {
      // Note: In a real implementation, you'd fetch this from auth.users via an admin function
      // For now, we'll get unique users from applications
      const { data, error } = await supabase
        .from('applications')
        .select('user_id, email, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get unique users
      const uniqueUsers = data?.reduce((acc: User[], app) => {
        if (!acc.find(u => u.id === app.user_id)) {
          acc.push({
            id: app.user_id,
            email: app.email,
            created_at: app.created_at,
            last_sign_in_at: app.created_at
          });
        }
        return acc;
      }, []) || [];

      setUsers(uniqueUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(app => app.application_type === typeFilter);
    }

    setFilteredApplications(filtered);
  };

  const updateApplicationStatus = async (applicationId: string, status: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status,
          review_notes: notes,
          reviewed_by_admin_id: user?.id
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Application status changed to ${status}`,
      });

      fetchApplications();
      setSelectedApplication(null);
      setReviewNotes('');
      setNewStatus('');
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-warning mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You don't have admin privileges to access this panel.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage applications and user accounts</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-warning" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="personal_loan">Personal Loan</SelectItem>
                      <SelectItem value="home_loan">Home Loan</SelectItem>
                      <SelectItem value="auto_loan">Auto Loan</SelectItem>
                      <SelectItem value="business_loan">Business Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const IconComponent = applicationTypeIcons[application.application_type as keyof typeof applicationTypeIcons] || FileText;
              
              return (
                <Card key={application.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {application.first_name} {application.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {applicationTypeLabels[application.application_type as keyof typeof applicationTypeLabels]}
                          </p>
                          <p className="text-sm text-muted-foreground">{application.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          {application.requested_amount && (
                            <p className="font-semibold">
                              ${application.requested_amount.toLocaleString()}
                            </p>
                          )}
                          {application.requested_limit && (
                            <p className="text-sm text-muted-foreground">
                              Limit: ${application.requested_limit.toLocaleString()}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                          {application.status.replace('_', ' ')}
                        </Badge>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((usr) => (
                  <div key={usr.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{usr.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined: {new Date(usr.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">User</Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Application Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Review Application</CardTitle>
              <CardDescription>
                {selectedApplication.first_name} {selectedApplication.last_name} - {' '}
                {applicationTypeLabels[selectedApplication.application_type as keyof typeof applicationTypeLabels]}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Application Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="font-medium">
                    {selectedApplication.first_name} {selectedApplication.last_name}
                  </p>
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
                  <Label>Annual Income</Label>
                  <p className="font-medium">
                    ${selectedApplication.annual_income?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                {selectedApplication.requested_amount && (
                  <div>
                    <Label>Requested Amount</Label>
                    <p className="font-medium">
                      ${selectedApplication.requested_amount.toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <Label>ID Verification</Label>
                  <Badge variant={selectedApplication.id_verification_status === 'verified' ? 'default' : 'secondary'}>
                    {selectedApplication.id_verification_status}
                  </Badge>
                </div>
              </div>

              {/* Review Section */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">New Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="additional_info_required">Additional Info Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Review Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes about this application..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                {selectedApplication.review_notes && (
                  <div>
                    <Label>Previous Notes</Label>
                    <p className="text-sm text-muted-foreground p-3 bg-muted rounded">
                      {selectedApplication.review_notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedApplication(null);
                    setReviewNotes('');
                    setNewStatus('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateApplicationStatus(selectedApplication.id, newStatus, reviewNotes)}
                  disabled={!newStatus}
                >
                  Update Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};