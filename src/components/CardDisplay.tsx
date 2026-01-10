import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Wallet, Eye } from 'lucide-react';
import premiumCardImage from '@/assets/premium-card.jpg';
import { cn } from '@/lib/utils';
import { CardDetailsModal } from './CardDetailsModal';

interface CardDisplayProps {
  card: {
    id: string;
    card_type: string;
    card_network: string;
    card_number?: string;
    cvv?: string;
    last4: string;
    expiry_date: string;
    status: string;
    credit_limit?: number;
    available_credit?: number;
  };
  className?: string;
}

export const CardDisplay = ({ card, className }: CardDisplayProps) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const getCardGradient = (type: string) => {
    switch (type.toLowerCase()) {
      case 'platinum':
      case 'premium':
        return 'from-slate-700 via-slate-800 to-slate-900';
      case 'gold':
        return 'from-amber-400 via-yellow-500 to-amber-600';
      case 'business':
        return 'from-blue-600 via-blue-700 to-blue-800';
      default:
        return 'from-primary via-primary/90 to-primary/80';
    }
  };

  const getNetworkIcon = (network: string) => {
    switch (network.toLowerCase()) {
      case 'visa':
        return (
          <div className="text-white font-bold text-2xl italic">VISA</div>
        );
      case 'mastercard':
        return (
          <div className="flex gap-1">
            <div className="w-8 h-8 rounded-full bg-red-500 opacity-80"></div>
            <div className="w-8 h-8 rounded-full bg-orange-500 opacity-80 -ml-4"></div>
          </div>
        );
      case 'amex':
      case 'american express':
        return (
          <div className="text-white font-bold text-xl">AMEX</div>
        );
      default:
        return <CreditCard className="w-8 h-8 text-white" />;
    }
  };

  return (
    <Card className={cn("overflow-hidden hover:shadow-xl transition-all duration-300", className)}>
      <CardContent className="p-0">
        <div className="relative">
          {/* Card Visual */}
          <div className={cn(
            "relative h-56 bg-gradient-to-br p-6 flex flex-col justify-between rounded-t-lg overflow-hidden",
            getCardGradient(card.card_type)
          )}>
            <img
              src={premiumCardImage}
              alt="Heritage premium card background"
              className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay pointer-events-none"
              loading="lazy"
            />
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
            </div>

            {/* Card Header */}
            <div className="relative flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm font-medium uppercase tracking-wider">
                  Heritage Bank
                </p>
                <p className="text-white text-xs mt-1 capitalize font-semibold">
                  {card.card_type} Card
                </p>
              </div>
              {getNetworkIcon(card.card_network)}
            </div>

            {/* Card Number - Show last 5 digits */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="w-6 h-6 text-white/60" />
                <p className="text-white text-2xl font-mono tracking-widest">
                  •••• •••• ••• {card.card_number ? card.card_number.slice(-5) : card.last4}
                </p>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white/60 text-xs uppercase">Valid Thru</p>
                  <p className="text-white font-mono text-sm">{card.expiry_date}</p>
                </div>
                {card.card_type.toLowerCase() === 'platinum' && (
                  <Badge className="bg-white/20 text-white border-white/30">
                    Premium
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Card Details */}
          <div className="p-6 bg-card space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge 
                  variant={card.status === 'active' ? 'default' : 'secondary'}
                  className="mt-1"
                >
                  {card.status}
                </Badge>
              </div>
              {card.credit_limit && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Credit Limit</p>
                  <p className="text-lg font-semibold">
                    ${card.credit_limit.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {card.status === 'active' && card.card_number && card.cvv && (
              <Button
                onClick={() => setShowDetailsModal(true)}
                variant="outline"
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Full Card Details
              </Button>
            )}

            {card.available_credit !== undefined && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Available Credit</span>
                  <span className="font-semibold">
                    ${card.available_credit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                    style={{ 
                      width: `${(card.available_credit / (card.credit_limit || 1)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {card.card_number && card.cvv && (
        <CardDetailsModal
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
          card={{
            id: card.id,
            card_number: card.card_number,
            cvv: card.cvv,
            expiry_date: card.expiry_date,
            card_type: card.card_type,
            card_network: card.card_network,
            last4: card.last4,
          }}
        />
      )}
    </Card>
  );
};