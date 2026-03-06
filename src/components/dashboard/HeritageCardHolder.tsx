import { useState } from 'react';
import { Eye, EyeOff, CreditCard, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HeritageSVGLogoTransparent } from '@/components/HeritageSVGLogoTransparent';

interface HeritageCardHolderProps {
  card: {
    id: string;
    card_type: string;
    card_network: string;
    card_number: string;
    cvv: string;
    last4: string;
    expiry_date: string;
    status: string;
    is_locked?: boolean;
    credit_limit?: number;
    available_credit?: number;
  };
}

export const HeritageCardHolder = ({ card }: HeritageCardHolderProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const getNetworkLogo = (network: string) => {
    switch (network.toLowerCase()) {
      case 'visa': return 'VISA';
      case 'mastercard': return 'MC';
      case 'amex': return 'AMEX';
      case 'discover': return 'DISC';
      default: return network.toUpperCase();
    }
  };

  const getCardGradient = (network: string) => {
    switch (network.toLowerCase()) {
      case 'visa': return 'from-[hsl(220,60%,25%)] to-[hsl(220,50%,40%)]';
      case 'mastercard': return 'from-[hsl(0,60%,30%)] to-[hsl(25,70%,45%)]';
      case 'amex': return 'from-[hsl(210,50%,30%)] to-[hsl(230,60%,45%)]';
      default: return 'from-[hsl(220,40%,20%)] to-[hsl(220,30%,35%)]';
    }
  };

  const maskedNumber = showDetails
    ? card.card_number.replace(/(.{4})/g, '$1 ').trim()
    : `•••• •••• •••• ${card.last4}`;

  return (
    <div className="w-full max-w-sm">
      {/* Card */}
      <div className={`relative aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${getCardGradient(card.card_network)} p-5 text-white shadow-lg overflow-hidden select-none`}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full border-[16px] border-white/40" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full border-[16px] border-white/30" />
        </div>

        <div className="relative h-full flex flex-col justify-between">
          {/* Top row: Heritage logo + network */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <HeritageSVGLogoTransparent size="sm" className="w-7 h-7" />
              <span className="text-[10px] font-semibold tracking-widest uppercase opacity-90">Heritage Bank</span>
            </div>
            <span className="text-lg font-bold italic tracking-wide">{getNetworkLogo(card.card_network)}</span>
          </div>

          {/* Chip */}
          <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300/80 to-yellow-500/60 border border-yellow-200/30" />

          {/* Card number */}
          <p className="font-mono text-base tracking-[0.18em] mt-1">{maskedNumber}</p>

          {/* Bottom row */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] uppercase opacity-60 tracking-wider">Valid Thru</p>
              <p className="font-mono text-sm">{showDetails ? card.expiry_date : '••/••'}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase opacity-60 tracking-wider">CVV</p>
              <p className="font-mono text-sm">{showDetails ? card.cvv : '•••'}</p>
            </div>
            {card.is_locked && (
              <Badge className="bg-red-500/80 text-white border-none text-[10px]">
                <Lock className="w-3 h-3 mr-1" />Locked
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Controls strip */}
      <div className="flex items-center justify-between mt-3 px-1">
        <div className="flex items-center gap-2">
          <Badge variant={card.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
            {card.status}
          </Badge>
          <span className="text-xs text-muted-foreground capitalize">{card.card_type}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
          {showDetails ? 'Hide' : 'Show'}
        </Button>
      </div>

      {/* Credit info */}
      {card.credit_limit && card.credit_limit > 0 && (
        <div className="mt-2 px-1">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Available</span>
            <span>${(card.available_credit || 0).toLocaleString()} / ${card.credit_limit.toLocaleString()}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${((card.available_credit || 0) / card.credit_limit) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
