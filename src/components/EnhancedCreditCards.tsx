import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CreditCard, Shield, Zap, Trophy, Crown, Award } from "lucide-react";
import cardTiersImage from "@/assets/card-tiers.jpg";
import { useToast } from "@/hooks/use-toast";

const creditCardTiers = [
  {
    id: "heritage-black",
    name: "Heritage Black Elite",
    tier: "Black",
    cashback: "5%",
    annualFee: 995,
    creditLimit: 100000,
    features: [
      "Unlimited Airport Lounge Access",
      "Personal Concierge Service", 
      "Premium Travel Insurance",
      "Priority Customer Service",
      "Exclusive Event Invitations"
    ],
    icon: Crown,
    gradient: "from-gray-900 via-gray-800 to-black",
    borderColor: "border-yellow-500",
    minIncome: 150000,
    description: "The ultimate banking experience for high-net-worth individuals"
  },
  {
    id: "heritage-platinum",
    name: "Heritage Platinum Elite",
    tier: "Platinum",
    cashback: "3%",
    annualFee: 495,
    creditLimit: 50000,
    features: [
      "Airport Lounge Access",
      "Concierge Service",
      "Travel Insurance", 
      "Purchase Protection",
      "Extended Warranty"
    ],
    icon: Trophy,
    gradient: "from-gray-600 via-gray-500 to-gray-400",
    borderColor: "border-gray-400",
    minIncome: 75000,
    description: "Premium benefits for sophisticated banking needs"
  },
  {
    id: "heritage-gold",
    name: "Heritage Gold Rewards",
    tier: "Gold",
    cashback: "2%",
    annualFee: 195,
    creditLimit: 25000,
    features: [
      "Cashback Rewards",
      "Travel Benefits",
      "Purchase Protection",
      "Fraud Monitoring",
      "Mobile Banking"
    ],
    icon: Award,
    gradient: "from-yellow-600 via-yellow-500 to-yellow-400",
    borderColor: "border-yellow-500",
    minIncome: 40000,
    description: "Enhanced rewards for everyday banking"
  },
  {
    id: "heritage-classic",
    name: "Heritage Classic",
    tier: "Standard",
    cashback: "1%",
    annualFee: 0,
    creditLimit: 10000,
    features: [
      "No Annual Fee",
      "Basic Rewards",
      "Fraud Protection",
      "Online Banking",
      "Mobile App"
    ],
    icon: CreditCard,
    gradient: "from-blue-600 via-blue-500 to-blue-400",
    borderColor: "border-blue-500",
    minIncome: 25000,
    description: "Essential banking features with no annual fee"
  }
];

const accountTypes = [
  {
    name: "Personal Checking",
    type: "personal_checking",
    minBalance: 0,
    interestRate: "0.05%",
    features: ["No minimum balance", "Unlimited transactions", "Mobile deposit", "Online banking"]
  },
  {
    name: "Personal Savings",
    type: "personal_savings", 
    minBalance: 100,
    interestRate: "2.25%",
    features: ["High yield savings", "Compound interest", "FDIC insured", "Mobile banking"]
  },
  {
    name: "Business Checking",
    type: "business_checking",
    minBalance: 500,
    interestRate: "0.10%",
    features: ["Business tools", "ACH transfers", "Wire transfers", "Business debit card"]
  },
  {
    name: "Business Savings",
    type: "business_savings",
    minBalance: 1000,
    interestRate: "2.50%",
    features: ["Higher interest rates", "Business analytics", "Treasury services", "Investment options"]
  }
];

interface EnhancedCreditCardsProps {
  onApplyClick?: (cardId: string) => void;
  onAccountTypeSelect?: (accountType: string) => void;
}

export const EnhancedCreditCards = ({ onApplyClick, onAccountTypeSelect }: EnhancedCreditCardsProps) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCardApply = (cardId: string, cardName: string) => {
    setSelectedCard(cardId);
    if (onApplyClick) {
      onApplyClick(cardId);
    }
    toast({
      title: "Application Started",
      description: `Starting application for ${cardName}`,
    });
  };

  const handleAccountSelect = (accountType: string, accountName: string) => {
    setSelectedAccount(accountType);
    if (onAccountTypeSelect) {
      onAccountTypeSelect(accountType);
    }
    toast({
      title: "Account Selected",
      description: `Selected ${accountName} for opening`,
    });
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Credit Cards Section */}
      <section>
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div>
            <h2 className="text-4xl font-bold text-primary mb-3">Premium Credit Cards</h2>
            <p className="text-muted-foreground text-lg">Discover the perfect card for your lifestyle with exclusive Heritage benefits</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="banking-card overflow-hidden hover-lift animate-scale-in group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center space-x-3">
                <Star className="h-7 w-7 text-accent animate-pulse" />
                <span className="text-2xl">Featured Cards Collection</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-xl">
                  <img 
                    src={cardTiersImage}
                    alt="Heritage Credit Card Collection"
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold mb-1">Heritage Card Collection</h3>
                    <p className="text-white/90">Premium banking redefined</p>
                  </div>
                </div>
              </div>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
            </CardContent>
          </Card>

          <div className="space-y-6">
            {creditCardTiers.slice(0, 2).map((card, index) => (
              <Card key={card.id} className={`banking-card hover-lift group relative overflow-hidden ${selectedCard === card.id ? 'ring-2 ring-primary' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <card.icon className="h-6 w-6 text-primary group-hover:animate-float" />
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{card.name}</h3>
                        <Badge variant="secondary" className={`bg-gradient-to-r ${card.gradient} text-white`}>
                          {card.tier}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-secondary">{card.cashback}</p>
                      <p className="text-sm text-muted-foreground">Cashback</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Credit Limit</p>
                      <p className="font-semibold">${card.creditLimit.toLocaleString()}</p>
                    </div>
                    <Button 
                      onClick={() => handleCardApply(card.id, card.name)}
                      variant="outline" 
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground banking-button"
                    >
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Card Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-fade-in">
          {creditCardTiers.map((card, index) => (
            <Card key={card.id} className={`banking-card hover-lift group relative overflow-hidden ${selectedCard === card.id ? 'ring-2 ring-primary' : ''} ${card.borderColor}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <CardContent className="p-6 relative z-10">
                <div className="text-center mb-4">
                  <card.icon className={`h-10 w-10 mx-auto mb-3 text-primary group-hover:animate-float`} />
                  <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{card.name}</h3>
                  <Badge variant="secondary" className={`bg-gradient-to-r ${card.gradient} text-white mb-2`}>
                    {card.tier}
                  </Badge>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cashback</span>
                    <span className="font-bold text-secondary">{card.cashback}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Annual Fee</span>
                    <span className="font-semibold">${card.annualFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Credit Limit</span>
                    <span className="font-semibold">${card.creditLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Min Income</span>
                    <span className="font-semibold">${card.minIncome.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium flex items-center">
                    <Shield className="h-3 w-3 mr-2 text-success" />
                    Key Features:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {card.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <Zap className="h-2 w-2 mr-2 text-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  onClick={() => handleCardApply(card.id, card.name)}
                  size="sm"
                  variant="outline" 
                  className={`w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground banking-button ${selectedCard === card.id ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  {selectedCard === card.id ? 'Selected' : 'Apply Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Account Types Section */}
      <section>
        <div className="mb-8 animate-slide-up">
          <h2 className="text-4xl font-bold text-primary mb-3">Heritage Account Types</h2>
          <p className="text-muted-foreground text-lg">Choose the perfect account type for your financial goals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-fade-in">
          {accountTypes.map((account, index) => (
            <Card key={account.type} className={`banking-card hover-lift group relative overflow-hidden ${selectedAccount === account.type ? 'ring-2 ring-primary' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardContent className="p-6 relative z-10">
                <div className="text-center mb-4">
                  <CreditCard className="h-10 w-10 mx-auto mb-3 text-secondary group-hover:animate-float" />
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{account.name}</h3>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Min Balance</span>
                    <span className="font-semibold">${account.minBalance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Interest Rate</span>
                    <span className="font-bold text-secondary">{account.interestRate}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium flex items-center">
                    <Shield className="h-3 w-3 mr-2 text-success" />
                    Features:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {account.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <Zap className="h-2 w-2 mr-2 text-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  onClick={() => handleAccountSelect(account.type, account.name)}
                  size="sm"
                  variant="outline" 
                  className={`w-full border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground banking-button ${selectedAccount === account.type ? 'bg-secondary text-secondary-foreground' : ''}`}
                >
                  {selectedAccount === account.type ? 'Selected' : 'Open Account'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};