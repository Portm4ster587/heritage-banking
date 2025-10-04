import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard,
  Building,
  Smartphone,
  Globe,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Shield
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  provider: string | null;
  type: string;
  account_number: string | null;
  status: string | null;
  is_default: boolean | null;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
}

const paymentProviders = [
  { 
    id: 'heleket', 
    name: 'Heleket Pay', 
    type: 'digital_wallet',
    icon: '💳',
    description: 'Fast and secure digital payments'
  },
  { 
    id: 'visa', 
    name: 'Visa', 
    type: 'card',
    icon: '💳',
    description: 'Credit and debit cards'
  },
  { 
    id: 'mastercard', 
    name: 'Mastercard', 
    type: 'card',
    icon: '💳',
    description: 'Credit and debit cards'
  },
  { 
    id: 'paypal', 
    name: 'PayPal', 
    type: 'digital_wallet',
    icon: '🏦',
    description: 'Digital wallet payments'
  },
  { 
    id: 'apple_pay', 
    name: 'Apple Pay', 
    type: 'mobile_payment',
    icon: '📱',
    description: 'Mobile contactless payments'
  },
  { 
    id: 'google_pay', 
    name: 'Google Pay', 
    type: 'mobile_payment',
    icon: '📱',
    description: 'Mobile contactless payments'
  },
  { 
    id: 'bank_transfer', 
    name: 'Bank Transfer', 
    type: 'bank',
    icon: '🏛️',
    description: 'Direct bank transfers'
  }
];

export const MerchantPayments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [methodDetails, setMethodDetails] = useState({
    account_number: '',
    routing_number: '',
    card_number: '',
    expiry: '',
    cvv: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async () => {
    if (!selectedProvider) {
      toast({
        title: "Provider Required",
        description: "Please select a payment provider",
        variant: "destructive"
      });
      return;
    }

    try {
      const provider = paymentProviders.find(p => p.id === selectedProvider);
      
      const { error } = await supabase
        .from('payment_methods')
        .insert([{ 
          user_id: user?.id as string,
          type: provider?.type || 'card',
          provider: selectedProvider,
          account_number: methodDetails.account_number || methodDetails.card_number || '',
          status: 'active',
          is_default: false
        }]);

      if (error) throw error;

      toast({
        title: "Payment Method Added",
        description: `${provider?.name} has been added to your account`,
      });

      setShowAddMethod(false);
      setSelectedProvider('');
      setMethodDetails({
        account_number: '',
        routing_number: '',
        card_number: '',
        expiry: '',
        cvv: '',
        email: '',
        phone: ''
      });
      fetchPaymentMethods();
      
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Addition Failed",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removePaymentMethod = async (methodId: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ status: 'inactive' })
        .eq('id', methodId);

      if (error) throw error;

      toast({
        title: "Payment Method Removed",
        description: "Payment method has been deactivated",
      });

      fetchPaymentMethods();
    } catch (error) {
      console.error('Error removing payment method:', error);
      toast({
        title: "Removal Failed",
        description: "Failed to remove payment method",
        variant: "destructive"
      });
    }
  };

  const getProviderInfo = (providerId: string) => {
    return paymentProviders.find(p => p.id === providerId) || paymentProviders[0];
  };

  const getStatusBadge = (method: PaymentMethod) => {
    if (method.status !== 'active') {
      return <Badge variant="outline">Inactive</Badge>;
    }
    if (method.is_default) {
      return <Badge className="bg-success text-success-foreground">Default</Badge>;
    }
    return <Badge variant="secondary">Active</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading payment methods...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Payment Methods</h2>
          <p className="text-muted-foreground">Manage your payment and transfer methods</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddMethod(true)}>
          <Plus className="w-4 h-4" />
          Add Method
        </Button>
      </div>

      {/* Featured Merchant - Heleket */}
      <Card className="banking-card border-accent/30 bg-gradient-to-r from-accent/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            Featured Payment Partner - Heleket Pay
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Heleket Pay Integration</h3>
              <p className="text-muted-foreground mb-3">
                Fast, secure, and reliable payment processing with instant confirmations
              </p>
              <div className="flex gap-2 mb-3">
                <Badge variant="secondary">Instant Transfer</Badge>
                <Badge variant="secondary">Low Fees</Badge>
                <Badge variant="secondary">24/7 Support</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl mb-2">💳</p>
              <Button 
                onClick={() => {
                  setSelectedProvider('heleket');
                  setShowAddMethod(true);
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Connect Heleket
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Your Payment Methods</h3>
        
        {paymentMethods.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payment Methods</h3>
              <p className="text-muted-foreground mb-4">
                Add your first payment method to start making transfers and deposits
              </p>
              <Button onClick={() => setShowAddMethod(true)}>
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paymentMethods
              .filter(method => method.status === 'active')
              .map((method) => {
                const provider = getProviderInfo(method.provider);
                return (
                  <Card key={method.id} className="banking-card hover-lift">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{provider.icon}</span>
                          <div>
                            <CardTitle className="text-lg">{provider.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{provider.description}</p>
                          </div>
                        </div>
                        {getStatusBadge(method)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Method Details */}
                      <div className="bg-muted/20 rounded-lg p-3 space-y-2 text-sm">
                        {method.account_number && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Account:</span>
                            <span className="font-mono">****{method.account_number.slice(-4)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="capitalize">{method.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Added:</span>
                          <span>{new Date(method.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removePaymentMethod(method.id)}
                          className="flex-1 gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddMethod} onOpenChange={setShowAddMethod}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Connect a new payment method for deposits and transfers
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Payment Provider</label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose provider" />
                </SelectTrigger>
                <SelectContent>
                  {paymentProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex items-center gap-2">
                        <span>{provider.icon}</span>
                        <span>{provider.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProvider && (
              <div className="space-y-3">
                {selectedProvider === 'heleket' && (
                  <>
                    <Input
                      placeholder="Email address"
                      value={methodDetails.email}
                      onChange={(e) => setMethodDetails({...methodDetails, email: e.target.value})}
                    />
                    <Input
                      placeholder="Phone number"
                      value={methodDetails.phone}
                      onChange={(e) => setMethodDetails({...methodDetails, phone: e.target.value})}
                    />
                  </>
                )}

                {(selectedProvider === 'visa' || selectedProvider === 'mastercard') && (
                  <>
                    <Input
                      placeholder="Card number"
                      value={methodDetails.card_number}
                      onChange={(e) => setMethodDetails({...methodDetails, card_number: e.target.value})}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="MM/YY"
                        value={methodDetails.expiry}
                        onChange={(e) => setMethodDetails({...methodDetails, expiry: e.target.value})}
                      />
                      <Input
                        placeholder="CVV"
                        value={methodDetails.cvv}
                        onChange={(e) => setMethodDetails({...methodDetails, cvv: e.target.value})}
                      />
                    </div>
                  </>
                )}

                {selectedProvider === 'bank_transfer' && (
                  <>
                    <Input
                      placeholder="Account number"
                      value={methodDetails.account_number}
                      onChange={(e) => setMethodDetails({...methodDetails, account_number: e.target.value})}
                    />
                    <Input
                      placeholder="Routing number"
                      value={methodDetails.routing_number}
                      onChange={(e) => setMethodDetails({...methodDetails, routing_number: e.target.value})}
                    />
                  </>
                )}

                {(selectedProvider === 'paypal' || selectedProvider === 'apple_pay' || selectedProvider === 'google_pay') && (
                  <Input
                    placeholder="Email address"
                    value={methodDetails.email}
                    onChange={(e) => setMethodDetails({...methodDetails, email: e.target.value})}
                  />
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={addPaymentMethod} className="flex-1">
                Add Method
              </Button>
              <Button variant="outline" onClick={() => setShowAddMethod(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};