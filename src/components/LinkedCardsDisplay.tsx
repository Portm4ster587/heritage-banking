import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CardData {
  id: string;
  card_type: string;
  card_network: string;
  last4: string;
  card_number: string;
  expiry_date: string;
  status: string;
  credit_limit?: number;
  available_credit?: number;
}

export const LinkedCardsDisplay = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNumbers, setShowNumbers] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCards();

      // Real-time subscription for card updates
      const channel = supabase
        .channel('linked-cards-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'cards', filter: `user_id=eq.${user.id}` },
          () => fetchCards()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .limit(5);

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCardBrandColor = (network: string) => {
    switch (network.toLowerCase()) {
      case 'visa': return 'from-blue-600 to-blue-800';
      case 'mastercard': return 'from-red-600 to-orange-600';
      case 'amex': return 'from-blue-500 to-indigo-700';
      case 'discover': return 'from-orange-500 to-orange-700';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  const formatCardNumber = (cardNumber: string) => {
    if (!showNumbers) {
      return `•••• •••• •••• ${cardNumber.slice(-4)}`;
    }
    return cardNumber.replace(/(.{4})/g, '$1 ').trim();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Linked Cards
        </h3>
        <button
          onClick={() => setShowNumbers(!showNumbers)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {showNumbers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showNumbers ? 'Hide' : 'Show'} Numbers
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`relative h-40 rounded-xl overflow-hidden bg-gradient-to-br ${getCardBrandColor(card.card_network)} p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          >
            {/* Card Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/30 -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/20 translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Card Content */}
            <div className="relative h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs opacity-80 uppercase">{card.card_type}</p>
                  <p className="text-sm font-semibold">{card.card_network}</p>
                </div>
                <Badge className="bg-white/20 text-white border-white/30">
                  {card.status}
                </Badge>
              </div>

              <div>
                <p className="font-mono text-lg tracking-wider mb-1">
                  {formatCardNumber(card.card_number)}
                </p>
                <div className="flex items-center justify-between text-xs opacity-80">
                  <span>Exp: {card.expiry_date}</span>
                  <span>Last 5: {card.card_number.slice(-5)}</span>
                </div>
              </div>

              {card.credit_limit && (
                <div className="mt-2 text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-80">Available Credit</span>
                    <span className="font-semibold">${(card.available_credit || 0).toLocaleString()}</span>
                  </div>
                  <div className="h-1 bg-white/30 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full"
                      style={{ width: `${((card.available_credit || 0) / card.credit_limit) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
