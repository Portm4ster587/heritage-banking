import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Receipt, 
  Plus, 
  Calendar, 
  DollarSign, 
  Building, 
  Trash2,
  Edit,
  Bell,
  Zap,
  Home,
  Wifi,
  Phone,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';

interface BillPayment {
  id: string;
  payee_name: string;
  payee_account: string;
  payee_type: string;
  amount: number;
  frequency: string;
  next_payment_date: string | null;
  last_payment_date: string | null;
  auto_pay: boolean;
  reminder_days: number;
  status: string;
}

const payeeTypeIcons: Record<string, React.ReactNode> = {
  utility: <Zap className="w-5 h-5" />,
  rent: <Home className="w-5 h-5" />,
  internet: <Wifi className="w-5 h-5" />,
  phone: <Phone className="w-5 h-5" />,
  credit_card: <CreditCard className="w-5 h-5" />,
  other: <Building className="w-5 h-5" />,
};

export const BillPayments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bills, setBills] = useState<BillPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBill, setEditingBill] = useState<BillPayment | null>(null);
  const [formData, setFormData] = useState({
    payee_name: '',
    payee_account: '',
    payee_type: 'utility',
    amount: '',
    frequency: 'monthly',
    next_payment_date: '',
    auto_pay: false,
    reminder_days: 3,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBills();
    }
  }, [user]);

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bill_payments')
        .select('*')
        .eq('user_id', user?.id)
        .order('next_payment_date', { ascending: true });

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.payee_name || !formData.payee_account || !formData.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const billData = {
        user_id: user?.id,
        payee_name: formData.payee_name,
        payee_account: formData.payee_account,
        payee_type: formData.payee_type,
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        next_payment_date: formData.next_payment_date || null,
        auto_pay: formData.auto_pay,
        reminder_days: formData.reminder_days,
        status: 'active',
      };

      if (editingBill) {
        const { error } = await supabase
          .from('bill_payments')
          .update(billData)
          .eq('id', editingBill.id);

        if (error) throw error;
        toast({ title: "Bill Updated", description: "Your bill payment has been updated." });
      } else {
        const { error } = await supabase
          .from('bill_payments')
          .insert(billData);

        if (error) throw error;
        toast({ title: "Bill Added", description: "Your new bill payment has been added." });
      }

      fetchBills();
      resetForm();
    } catch (error) {
      console.error('Error saving bill:', error);
      toast({
        title: "Error",
        description: "Failed to save bill payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBill = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bill_payments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setBills(prev => prev.filter(b => b.id !== id));
      toast({ title: "Bill Deleted", description: "The bill payment has been removed." });
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast({
        title: "Error",
        description: "Failed to delete bill payment.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      payee_name: '',
      payee_account: '',
      payee_type: 'utility',
      amount: '',
      frequency: 'monthly',
      next_payment_date: '',
      auto_pay: false,
      reminder_days: 3,
    });
    setEditingBill(null);
    setShowAddDialog(false);
  };

  const openEditDialog = (bill: BillPayment) => {
    setEditingBill(bill);
    setFormData({
      payee_name: bill.payee_name,
      payee_account: bill.payee_account,
      payee_type: bill.payee_type,
      amount: bill.amount.toString(),
      frequency: bill.frequency,
      next_payment_date: bill.next_payment_date || '',
      auto_pay: bill.auto_pay,
      reminder_days: bill.reminder_days,
    });
    setShowAddDialog(true);
  };

  const getStatusBadge = (bill: BillPayment) => {
    if (!bill.next_payment_date) return null;
    
    const daysUntilDue = Math.ceil(
      (new Date(bill.next_payment_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDue < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (daysUntilDue <= 3) {
      return <Badge className="bg-yellow-500">Due Soon</Badge>;
    } else if (daysUntilDue <= 7) {
      return <Badge variant="secondary">Upcoming</Badge>;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading bill payments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Bill Payments</h2>
          <p className="text-muted-foreground">Manage your recurring bills and payments</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Bill
        </Button>
      </div>

      {bills.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="text-center py-12">
            <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Bills Added</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your bills to never miss a payment.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Bill
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bills.map((bill) => (
            <Card key={bill.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {payeeTypeIcons[bill.payee_type] || payeeTypeIcons.other}
                    </div>
                    <div>
                      <CardTitle className="text-base">{bill.payee_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{bill.payee_account}</p>
                    </div>
                  </div>
                  {getStatusBadge(bill)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    Amount
                  </div>
                  <span className="font-semibold">${bill.amount.toLocaleString()}</span>
                </div>
                
                {bill.next_payment_date && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Next Due
                    </div>
                    <span className="text-sm">
                      {format(new Date(bill.next_payment_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Bell className="w-4 h-4" />
                    Auto-Pay
                  </div>
                  <Badge variant={bill.auto_pay ? "default" : "secondary"}>
                    {bill.auto_pay ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openEditDialog(bill)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteBill(bill.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Bill Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBill ? 'Edit Bill' : 'Add New Bill'}</DialogTitle>
            <DialogDescription>
              {editingBill ? 'Update your bill payment details.' : 'Add a new bill to track.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payee_name">Payee Name *</Label>
              <Input
                id="payee_name"
                value={formData.payee_name}
                onChange={(e) => setFormData(prev => ({ ...prev, payee_name: e.target.value }))}
                placeholder="e.g., Electric Company"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payee_account">Account Number *</Label>
              <Input
                id="payee_account"
                value={formData.payee_account}
                onChange={(e) => setFormData(prev => ({ ...prev, payee_account: e.target.value }))}
                placeholder="e.g., 123456789"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payee_type">Type</Label>
                <Select
                  value={formData.payee_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, payee_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utility">Utility</SelectItem>
                    <SelectItem value="rent">Rent/Mortgage</SelectItem>
                    <SelectItem value="internet">Internet</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One Time</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_payment_date">Next Due Date</Label>
                <Input
                  id="next_payment_date"
                  type="date"
                  value={formData.next_payment_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, next_payment_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="auto_pay">Auto-Pay</Label>
                <p className="text-sm text-muted-foreground">Automatically pay on due date</p>
              </div>
              <Switch
                id="auto_pay"
                checked={formData.auto_pay}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_pay: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : editingBill ? "Update Bill" : "Add Bill"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
