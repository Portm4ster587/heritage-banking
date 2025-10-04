import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Eye, 
  EyeOff, 
  Shield, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Plus,
  Zap
} from 'lucide-react';

interface UserCard {
  id: string;
  account_id: string;
  card_type: string;
  card_network: string;
  last4: string;
  status: string | null;
  activation_status: string | null;
  expiry_date: string;
  cvv: string;
  card_number: string;
  credit_limit: number | null;
  available_credit: number | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
}

export const CardManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCardDetails, setShowCardDetails] = useState<string | null>(null);
  const [activationCode, setActivationCode] = useState('');
  const [showActivation, setShowActivation] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserCards();
    }
  }, [user]);

  const fetchUserCards = async () => {
    try {
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', user?.id);

      if (!accountsData || accountsData.length === 0) {
        setLoading(false);
        return;
      }

      const accountIds = accountsData.map(a => a.id);
      
      const { data: cardsData, error } = await supabase
        .from('cards')
        .select('*')
        .in('account_id', accountIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(cardsData || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast({
        title: "Error",
        description: "Failed to load your cards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivateCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .update({ 
          activation_status: 'active',
          status: 'active'
        })
        .eq('id', cardId);

      if (error) throw error;

      toast({
        title: "Card Activated!",
        description: "Your card has been successfully activated and is ready to use.",
      });

      setShowActivation(null);
      setActivationCode('');
      fetchUserCards();
    } catch (error) {
      console.error('Error activating card:', error);
      toast({
        title: "Activation Failed",
        description: "Failed to activate your card. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getCardIcon = (network: string) => {
    switch (network?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'american express':
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  const getCardGradient = (cardType: string) => {
    switch (cardType?.toLowerCase()) {
      case 'heritage-black':
        return 'from-gray-900 via-gray-800 to-black';
      case 'heritage-platinum':
        return 'from-gray-600 via-gray-500 to-gray-400';
      case 'heritage-gold':
        return 'from-yellow-600 via-yellow-500 to-yellow-400';
      default:
        return 'from-blue-600 via-blue-500 to-blue-400';
    }
  };

  const getStatusBadge = (status: string, activationStatus: string) => {
    if (status === 'active' && activationStatus === 'active') {
      return <Badge className="bg-success text-success-foreground">Active</Badge>;
    }
    if (status === 'pending' || activationStatus === 'inactive') {
      return <Badge variant="secondary">Needs Activation</Badge>;
    }
    if (status === 'blocked') {
      return <Badge variant="destructive">Blocked</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading your cards...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Your Credit Cards</h2>
          <p className="text-muted-foreground">Manage and activate your Heritage cards</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Request New Card
        </Button>
      </div>

      {cards.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Cards Found</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any credit cards yet. Apply for your first Heritage card today!
            </p>
            <Button>Apply for Credit Card</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.id} className="banking-card hover-lift overflow-hidden">
              {/* Card Visual */}
              <div className={`h-48 bg-gradient-to-br ${getCardGradient(card.card_type)} p-6 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{getCardIcon(card.network)}</span>
                    <div className="text-right">
                      <p className="text-xs opacity-80">US Heritage Bank</p>
                      <p className="text-lg font-bold">{card.network?.toUpperCase()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs opacity-80">CARD NUMBER</p>
                      <p className="text-lg font-mono tracking-wider">
                        •••• •••• •••• {card.last4}
                      </p>
                    </div>
                    
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs opacity-80">CARDHOLDER</p>
                        <p className="text-sm font-semibold">{card.embossed_name || 'CARD HOLDER'}</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-80">EXPIRES</p>
                        <p className="text-sm font-semibold">
                          {card.exp_month?.toString().padStart(2, '0')}/{card.exp_year?.toString().slice(-2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Info */}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg capitalize">
                    {card.card_type?.replace('-', ' ') || 'Heritage Card'}
                  </CardTitle>
                  {getStatusBadge(card.status, card.activation_status)}
                </div>
                <CardDescription>
                  {card.network} ending in {card.last4}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Activation Status */}
                {card.activation_status === 'inactive' && card.status === 'pending' && (
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium text-warning">Card Needs Activation</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Your card has been issued but needs to be activated before use.
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => setShowActivation(card.id)}
                      className="w-full gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Activate Card
                    </Button>
                  </div>
                )}

                {card.activation_status === 'active' && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-success">Card Active & Ready</span>
                    </div>
                  </div>
                )}

                {/* Card Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setShowCardDetails(showCardDetails === card.id ? null : card.id)}
                  >
                    {showCardDetails === card.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Shield className="w-4 h-4" />
                    Security
                  </Button>
                </div>

                {/* Card Details Dropdown */}
                {showCardDetails === card.id && (
                  <div className="bg-muted/20 rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Card Type:</span>
                      <span>{card.card_type?.replace('-', ' ').toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network:</span>
                      <span>{card.network}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="capitalize">{card.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issued:</span>
                      <span>{new Date(card.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Card Activation Dialog */}
      <Dialog open={showActivation !== null} onOpenChange={() => setShowActivation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate Your Card</DialogTitle>
            <DialogDescription>
              Enter the activation code sent to your registered phone number or email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Activation Code</label>
              <Input
                placeholder="Enter 6-digit code"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value)}
                maxLength={6}
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => handleActivateCard(showActivation!)}
                disabled={activationCode.length !== 6}
                className="flex-1"
              >
                Activate Card
              </Button>
              <Button variant="outline" onClick={() => setShowActivation(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};