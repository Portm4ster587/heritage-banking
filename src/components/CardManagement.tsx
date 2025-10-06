import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CardDisplay } from './CardDisplay';
import { CreditCard, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const CardManagement = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {cards.map((card) => (
            <CardDisplay key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
};
