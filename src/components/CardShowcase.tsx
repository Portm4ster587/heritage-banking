import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  CreditCard, 
  Star, 
  Zap, 
  Shield, 
  Gem, 
  Plane,
  ShoppingBag,
  Car,
  Home,
  Building
} from 'lucide-react';

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
    color: 'bg-gradient-to-br from-slate-600 to-slate-800',
    textColor: 'text-white',
    benefits: [
      'No annual fee',
      '1.5% cash back on all purchases',
      '0% intro APR for 12 months',
      'No foreign transaction fees'
    ],
    image: '/lovable-uploads/a360d89a-0a5b-49b1-9d15-bf838080ff78.png'
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
    color: 'bg-gradient-to-br from-blue-600 to-blue-800',
    textColor: 'text-white',
    benefits: [
      '3x points on dining & travel',
      '2x points on gas & groceries', 
      '1x points on all other purchases',
      'Welcome bonus: 60,000 points',
      'Travel insurance included'
    ],
    image: '/lovable-uploads/a360d89a-0a5b-49b1-9d15-bf838080ff78.png'
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
    color: 'bg-gradient-to-br from-purple-600 to-purple-900',
    textColor: 'text-white',
    benefits: [
      '5x points on travel booked through portal',
      '3x points on dining worldwide',
      'Annual $300 travel credit',
      'Priority Pass lounge access',
      'Concierge service 24/7',
      'Global Entry/TSA PreCheck credit'
    ],
    image: '/lovable-uploads/a360d89a-0a5b-49b1-9d15-bf838080ff78.png'
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
    color: 'bg-gradient-to-br from-green-600 to-green-800',
    textColor: 'text-white',
    benefits: [
      'No annual fee first year',
      '2x points on business purchases',
      'Employee cards at no extra cost',
      'Expense management tools',
      'Business credit building'
    ],
    image: '/lovable-uploads/a360d89a-0a5b-49b1-9d15-bf838080ff78.png'
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
    color: 'bg-gradient-to-br from-orange-500 to-orange-700'
  },
  {
    id: 'auto_loan',
    name: 'Auto Loan',
    description: 'Finance your next vehicle',
    rate: '3.49% - 18.99% APR',
    amount: 'Up to $100,000',
    icon: Car,
    color: 'bg-gradient-to-br from-red-500 to-red-700'
  },
  {
    id: 'home_loan',
    name: 'Home Loan',
    description: 'Make your dream home a reality',
    rate: '6.25% - 8.50% APR',
    amount: 'Up to $2,000,000',
    icon: Home,
    color: 'bg-gradient-to-br from-teal-500 to-teal-700'
  }
];

export const CardShowcase = ({ onApply }: CardShowcaseProps) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Credit Cards Section */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">Heritage Credit Cards</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from our premium selection of credit cards, each designed to reward your lifestyle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardTypes.map((card) => {
            const IconComponent = card.icon;
            return (
              <Card 
                key={card.id}
                className={cn(
                  "relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group",
                  selectedCard === card.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}
              >
                {/* Card Visual */}
                <div 
                  className={cn(
                    "h-32 relative flex items-center justify-center",
                    card.color
                  )}
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative flex items-center space-x-3">
                    <div className="w-8 h-8 bg-heritage-gold rounded flex items-center justify-center">
                      <span className="text-heritage-blue font-bold text-sm">H</span>
                    </div>
                    <div className={cn("text-right", card.textColor)}>
                      <div className="text-sm font-medium">{card.name}</div>
                      <div className="text-xs opacity-90">{card.type}</div>
                    </div>
                  </div>
                  <IconComponent className={cn("absolute top-3 right-3 w-6 h-6", card.textColor)} />
                  
                  {/* Chip */}
                  <div className="absolute bottom-3 left-3 w-6 h-4 bg-heritage-gold/80 rounded-sm"></div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{card.name}</h3>
                      <p className="text-sm text-muted-foreground">{card.description}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">APR</span>
                        <span className="font-medium">{card.apr}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Annual Fee</span>
                        <span className="font-medium">{card.annualFee}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-primary">{card.rewards}</p>
                    </div>

                    {selectedCard === card.id && (
                      <div className="space-y-3 animate-fade-in">
                        <div className="border-t pt-3">
                          <h4 className="font-medium text-sm mb-2">Key Benefits:</h4>
                          <ul className="space-y-1">
                            {card.benefits.map((benefit, index) => (
                              <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                                <span className="text-primary mt-0.5">•</span>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <Button 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApply('credit_card');
                      }}
                    >
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Loan Products Section */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">Loan Products</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Competitive rates and flexible terms for all your financing needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loanProducts.map((loan) => {
            const IconComponent = loan.icon;
            return (
              <Card 
                key={loan.id}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <CardHeader>
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-2",
                    loan.color
                  )}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{loan.name}</CardTitle>
                  <CardDescription>{loan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rate</span>
                      <span className="font-medium">{loan.rate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span className="font-medium">{loan.amount}</span>
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