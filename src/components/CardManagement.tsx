import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CardDisplay } from './CardDisplay';
import { CreditCard, Plus, Lock, Unlock, DollarSign, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface CardData {
  id: string;
  card_type: string;
  card_network: string;
  last4: string;
  expiry_date: string;
  status: string;
  card_number?: string;
  cvv?: string;
  credit_limit?: number;
  available_credit?: number;
  spending_limit?: number;
  is_locked?: boolean;
}

export const CardManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [newSpendingLimit, setNewSpendingLimit] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user]);

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCardLock = async (card: CardData) => {
    setUpdating(true);
    try {
      const newLockStatus = !card.is_locked;
      const { error } = await supabase
        .from('cards')
        .update({ is_locked: newLockStatus })
        .eq('id', card.id);

      if (error) throw error;

      setCards(prev => prev.map(c => 
        c.id === card.id ? { ...c, is_locked: newLockStatus } : c
      ));

      toast({
        title: newLockStatus ? "Card Locked" : "Card Unlocked",
        description: newLockStatus 
          ? "Your card has been temporarily locked. No transactions will be processed."
          : "Your card has been unlocked and is ready for use.",
      });
    } catch (error) {
      console.error('Error toggling card lock:', error);
      toast({
        title: "Error",
        description: "Failed to update card status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const updateSpendingLimit = async () => {
    if (!selectedCard || !newSpendingLimit) return;

    setUpdating(true);
    try {
      const limit = parseFloat(newSpendingLimit);
      if (isNaN(limit) || limit < 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid spending limit.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('cards')
        .update({ spending_limit: limit })
        .eq('id', selectedCard.id);

      if (error) throw error;

      setCards(prev => prev.map(c => 
        c.id === selectedCard.id ? { ...c, spending_limit: limit } : c
      ));

      toast({
        title: "Spending Limit Updated",
        description: `Your daily spending limit has been set to $${limit.toLocaleString()}.`,
      });

      setShowSettingsDialog(false);
      setNewSpendingLimit('');
    } catch (error) {
      console.error('Error updating spending limit:', error);
      toast({
        title: "Error",
        description: "Failed to update spending limit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const openSettings = (card: CardData) => {
    setSelectedCard(card);
    setNewSpendingLimit(card.spending_limit?.toString() || '5000');
    setShowSettingsDialog(true);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading your cards...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-2">My Cards</h2>
          <p className="text-muted-foreground">Manage your Heritage Bank cards</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="banking-button">
            <Plus className="w-4 h-4 mr-2" />
            Request New Card
          </Button>
          <Button variant="outline" className="banking-button">Activate Card</Button>
        </div>
      </div>

      {cards.length === 0 ? (
        <Card className="banking-card border-2 border-dashed">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">No Cards Found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              You don't have any cards yet. Request your first Heritage Bank card to start enjoying exclusive benefits and rewards.
            </p>
            <Button className="banking-button" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Request Your First Card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {cards.map((card) => (
            <div key={card.id} className="space-y-4">
              <CardDisplay card={card} />
              
              {/* Card Controls */}
              <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Card Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {card.is_locked ? (
                        <Lock className="w-5 h-5 text-destructive" />
                      ) : (
                        <Unlock className="w-5 h-5 text-green-500" />
                      )}
                      <div>
                        <p className="font-medium">Card Lock</p>
                        <p className="text-sm text-muted-foreground">
                          {card.is_locked ? "Card is currently locked" : "Card is active"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={card.is_locked || false}
                      onCheckedChange={() => toggleCardLock(card)}
                      disabled={updating}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-heritage-gold" />
                      <div>
                        <p className="font-medium">Daily Spending Limit</p>
                        <p className="text-sm text-muted-foreground">
                          ${(card.spending_limit || 5000).toLocaleString()} per day
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openSettings(card)}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Spending Limit Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Spending Limit</DialogTitle>
            <DialogDescription>
              Set a daily spending limit for your card ending in {selectedCard?.last4}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="spending-limit">Daily Limit ($)</Label>
              <Input
                id="spending-limit"
                type="number"
                value={newSpendingLimit}
                onChange={(e) => setNewSpendingLimit(e.target.value)}
                placeholder="Enter amount"
                min="0"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This limit will apply to all transactions made with this card within a 24-hour period.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={updateSpendingLimit} disabled={updating}>
              {updating ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
