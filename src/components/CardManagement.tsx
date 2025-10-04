import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CardManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCards();
    }
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

  if (loading) {
    return <div>Loading cards...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Card Management</h2>
        <Button>
          <CreditCard className="w-4 h-4 mr-2" />
          Request New Card
        </Button>
      </div>

      <div className="grid gap-4">
        {cards.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">No cards found</p>
            </CardContent>
          </Card>
        ) : (
          cards.map((card) => (
            <Card key={card.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{card.card_type}</span>
                  <Badge>{card.status || 'active'}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  ****  ****  ****  {card.last4}
                </p>
                <p className="text-sm mt-2">
                  {card.card_network}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
