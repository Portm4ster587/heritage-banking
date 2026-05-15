import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  CreditCard, 
  Star, 
  Gem, 
  Building,
  Zap,
  Car,
  Home,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { HeritageSVGLogoTransparent } from '@/components/HeritageSVGLogoTransparent';

interface CardShowcaseProps {
  onApply: (cardType: string) => void;
}

const cardTypes = [
  {
    id: 'heritage_classic',
    name: 'Heritage Classic',
    type: 'Classic Rewards',
    description: 'Perfect for everyday spending with essential benefits',
    apr: '15.99% - 24.99%',
    annualFee: '$0',
    rewards: '1.5% cash back on all purchases',
    icon: CreditCard,
    gradient: 'from-[hsl(220,60%,22%)] via-[hsl(220,55%,30%)] to-[hsl(225,50%,38%)]',
    chipColor: 'from-[hsl(45,80%,55%)] to-[hsl(45,70%,45%)]',
    network: 'VISA',
    badge: null,
    benefits: [
      'No annual fee',
      '1.5% cash back on all purchases',
      '0% intro APR for 12 months',
      'No foreign transaction fees'
    ],
  },
  {
    id: 'heritage_preferred',
    name: 'Heritage Preferred',
    type: 'Premium Rewards',
    description: 'Enhanced rewards for frequent spenders',
    apr: '18.99% - 26.99%',
    annualFee: '$95',
    rewards: 'Up to 3x points on select categories',
    icon: Star,
    gradient: 'from-[hsl(220,70%,18%)] via-[hsl(230,65%,26%)] to-[hsl(240,60%,35%)]',
    chipColor: 'from-[hsl(45,90%,60%)] to-[hsl(40,85%,48%)]',
    network: 'VISA',
    badge: 'Popular',
    benefits: [
      '3x points on dining & travel',
      '2x points on gas & groceries',
      '1x points on all other purchases',
      'Welcome bonus: 60,000 points',
      'Travel insurance included'
    ],
  },
  {
    id: 'heritage_elite',
    name: 'Heritage Elite',
    type: 'Elite Benefits',
    description: 'Exclusive perks for our most valued customers',
    apr: '16.99% - 23.99%',
    annualFee: '$450',
    rewards: 'Up to 5x points + exclusive perks',
    icon: Gem,
    gradient: 'from-[hsl(45,80%,40%)] via-[hsl(40,75%,35%)] to-[hsl(35,70%,28%)]',
    chipColor: 'from-[hsl(0,0%,90%)] to-[hsl(0,0%,75%)]',
    network: 'MC',
    badge: 'Exclusive',
    benefits: [
      '5x points on travel booked through portal',
      '3x points on dining worldwide',
      'Annual $300 travel credit',
      'Priority Pass lounge access',
      'Concierge service 24/7',
      'Global Entry/TSA PreCheck credit'
    ],
  },
  {
    id: 'heritage_business',
    name: 'Heritage Business',
    type: 'Business Card',
    description: 'Designed for business owners and entrepreneurs',
    apr: '17.24% - 24.24%',
    annualFee: '$0',
    rewards: '2x points on business purchases',
    icon: Building,
    gradient: 'from-[hsl(220,50%,15%)] via-[hsl(210,45%,22%)] to-[hsl(200,40%,30%)]',
    chipColor: 'from-[hsl(45,85%,55%)] to-[hsl(45,75%,42%)]',
    network: 'VISA',
    badge: null,
    benefits: [
      'No annual fee first year',
      '2x points on business purchases',
      'Employee cards at no extra cost',
      'Expense management tools',
      'Business credit building'
    ],
  }
];

const loanProducts = [
  {
    id: 'personal_loan',
    name: 'Personal Loan',
    description: 'Quick funding for personal expenses',
    rate: '6.99% - 24.99% APR',
    amount: 'Up to $50,000',
    icon: Zap,
  },
  {
    id: 'auto_loan',
    name: 'Auto Loan',
    description: 'Finance your next vehicle',
    rate: '3.49% - 18.99% APR',
    amount: 'Up to $100,000',
    icon: Car,
  },
  {
    id: 'home_loan',
    name: 'Home Loan',
    description: 'Make your dream home a reality',
    rate: '6.25% - 8.50% APR',
    amount: 'Up to $2,000,000',
    icon: Home,
  }
];

export const CardShowcase = ({ onApply }: CardShowcaseProps) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  return (
    <div className="space-y-12">
      {/* Credit Cards Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-3">Heritage Credit Cards</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our premium selection of credit cards, each designed to reward your lifestyle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cardTypes.map((card) => {
            const isExpanded = expandedCard === card.id;
            return (
              <div key={card.id} className="space-y-4">
                {/* Physical Card Design */}
                <div
                  className={cn(
                    "relative aspect-[1.586/1] rounded-2xl overflow-hidden shadow-xl cursor-pointer",
                    "bg-gradient-to-br",
                    card.gradient,
                    "hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                  )}
                  onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                >
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-[0.06]">
                    <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full border-[20px] border-white/40" />
                    <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full border-[20px] border-white/30" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-[12px] border-white/20" />
                  </div>

                  {/* Holographic stripe */}
                  <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-b from-white/[0.04] via-white/[0.08] to-white/[0.02]" />

                  <div className="relative h-full p-5 sm:p-6 flex flex-col justify-between text-white">
                    {/* Top: Logo + Badge + Network */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <HeritageSVGLogoTransparent size="sm" className="w-8 h-8" />
                        <div>
                          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase opacity-90 block">First Heritage Bank of America</span>
                          <span className="text-[9px] tracking-wider opacity-60">{card.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {card.badge && (
                          <Badge className="bg-[hsl(var(--heritage-gold))]/20 text-[hsl(45,95%,70%)] border-[hsl(45,95%,55%)]/30 text-[9px] px-2 py-0.5">
                            {card.badge}
                          </Badge>
                        )}
                        <span className="text-xl font-bold italic tracking-wider opacity-90">{card.network}</span>
                      </div>
                    </div>

                    {/* Chip */}
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-11 h-8 rounded-md bg-gradient-to-br border border-white/20",
                        card.chipColor
                      )}>
                        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-px p-0.5 opacity-30">
                          {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="bg-white/40 rounded-[1px]" />
                          ))}
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full border border-white/30" />
                      </div>
                    </div>

                    {/* Card Number */}
                    <p className="font-mono text-lg sm:text-xl tracking-[0.2em] opacity-90">
                      •••• •••• •••• ••••
                    </p>

                    {/* Bottom: Name + Expiry */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[9px] uppercase opacity-50 tracking-wider">Card Holder</p>
                        <p className="text-sm font-medium tracking-wider uppercase">{card.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase opacity-50 tracking-wider">Valid Thru</p>
                        <p className="font-mono text-sm opacity-80">••/••</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Info Panel */}
                <Card className="border-border/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{card.name}</h3>
                        <p className="text-sm text-muted-foreground">{card.description}</p>
                      </div>
                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">APR</span>
                        <p className="font-semibold text-foreground">{card.apr}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Annual Fee</span>
                        <p className="font-semibold text-foreground">{card.annualFee}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rewards</span>
                        <p className="font-semibold text-primary text-xs">{card.rewards}</p>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-3 animate-fade-in border-t border-border pt-3">
                        <h4 className="font-semibold text-sm text-foreground">Key Benefits</h4>
                        <ul className="space-y-2">
                          {card.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <Check className="w-4 h-4 text-[hsl(var(--success))] mt-0.5 shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-[hsl(var(--primary-dark))] hover:opacity-90 text-primary-foreground font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApply('credit_card');
                      }}
                    >
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      {/* Loan Products Section */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-3">Loan Products</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Competitive rates and flexible terms for all your financing needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loanProducts.map((loan) => {
            const IconComponent = loan.icon;
            return (
              <Card 
                key={loan.id}
                className="hover:shadow-lg transition-all duration-300 border-border/50 group"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--primary-dark))] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconComponent className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{loan.name}</h3>
                    <p className="text-sm text-muted-foreground">{loan.description}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="font-semibold text-foreground">{loan.rate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-semibold text-foreground">{loan.amount}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => onApply(loan.id)}
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};
