import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { HeritageCardHolder } from "@/components/dashboard/HeritageCardHolder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, Unlock, DollarSign, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HeritageLoadingScreen } from "@/components/HeritageLoadingScreen";

interface CardData {
  id: string;
  card_type: string;
  card_network: string;
  last4: string;
  expiry_date: string;
  status: string;
  card_number?: string;
  credit_limit?: number;
  available_credit?: number;
  spending_limit?: number;
  is_locked?: boolean;
}

export default function Cards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingCard, setUpdatingCard] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Heritage Bank - My Cards";
    if (user) fetchCards();
  }, [user]);

  const fetchCards = async () => {
    try {
      const { data } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user?.id);
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCardLock = async (cardId: string, currentLock: boolean) => {
    setUpdatingCard(cardId);
    try {
      const { error } = await supabase
        .from('cards')
        .update({ is_locked: !currentLock })
        .eq('id', cardId);

      if (error) throw error;

      setCards(cards.map(c => c.id === cardId ? { ...c, is_locked: !currentLock } : c));
      toast({
        title: !currentLock ? "Card Locked" : "Card Unlocked",
        description: !currentLock ? "Your card has been temporarily locked" : "Your card is now active"
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update card", variant: "destructive" });
    } finally {
      setUpdatingCard(null);
    }
  };

  const updateSpendingLimit = async (cardId: string, limit: number) => {
    setUpdatingCard(cardId);
    try {
      const { error } = await supabase
        .from('cards')
        .update({ spending_limit: limit })
        .eq('id', cardId);

      if (error) throw error;

      setCards(cards.map(c => c.id === cardId ? { ...c, spending_limit: limit } : c));
      toast({ title: "Spending Limit Updated", description: `New limit: $${limit.toLocaleString()}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update spending limit", variant: "destructive" });
    } finally {
      setUpdatingCard(null);
    }
  };

  if (loading) return <HeritageLoadingScreen message="Loading your cards..." />;

  return (
    <main className="container mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
      <BackButton to="/dashboard" label="Back to Dashboard" className="mb-4" />
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">My Cards</h1>
        <p className="text-muted-foreground">Manage your credit and debit cards</p>
      </div>

      {cards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No cards found</p>
            <p className="text-muted-foreground mb-4">Cards will appear here once issued to your account</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Compact card carousel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <HeritageCardHolder key={card.id} card={card} />
            ))}
          </div>

          {/* Card Controls */}
          <div className="space-y-6">
            {cards.map((card) => (
              <Card key={card.id} className="hightech-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Controls — ****{card.last4}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Lock/Unlock */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {card.is_locked ? (
                        <Lock className="w-5 h-5 text-destructive" />
                      ) : (
                        <Unlock className="w-5 h-5 text-green-600" />
                      )}
                      <div>
                        <p className="font-medium text-sm">Card Lock</p>
                        <p className="text-xs text-muted-foreground">
                          {card.is_locked ? "Locked" : "Active"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={card.is_locked || false}
                      onCheckedChange={() => toggleCardLock(card.id, card.is_locked || false)}
                      disabled={updatingCard === card.id}
                    />
                  </div>

                  {/* Spending Limit */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <Label className="text-sm">Daily Spending Limit</Label>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        defaultValue={card.spending_limit || 5000}
                        className="max-w-[160px] h-9"
                        id={`limit-${card.id}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updatingCard === card.id}
                        onClick={() => {
                          const input = document.getElementById(`limit-${card.id}`) as HTMLInputElement;
                          updateSpendingLimit(card.id, parseFloat(input.value));
                        }}
                      >
                        {updatingCard === card.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
