import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CreditCard, Shield, Zap } from "lucide-react";
import premiumCardImage from "@/assets/premium-card.jpg";

const creditCards = [
  {
    name: "Heritage Platinum Elite",
    tier: "Premium",
    cashback: "3%",
    annualFee: 495,
    creditLimit: 50000,
    features: ["Airport Lounge Access", "Concierge Service", "Travel Insurance"],
    color: "bg-gradient-to-r from-gray-800 to-black"
  },
  {
    name: "Heritage Gold Rewards",
    tier: "Gold",
    cashback: "2%",
    annualFee: 195,
    creditLimit: 25000,
    features: ["Cashback Rewards", "Travel Benefits", "Purchase Protection"],
    color: "bg-gradient-to-r from-yellow-600 to-yellow-800"
  },
  {
    name: "Heritage Classic",
    tier: "Standard",
    cashback: "1%",
    annualFee: 0,
    creditLimit: 10000,
    features: ["No Annual Fee", "Basic Rewards", "Fraud Protection"],
    color: "bg-gradient-to-r from-blue-600 to-blue-800"
  }
];

export const CreditCardSection = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-2">Credit Cards</h2>
          <p className="text-muted-foreground">Choose the perfect card for your lifestyle</p>
        </div>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground banking-button">
          Apply Now
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="banking-card overflow-hidden hover-lift animate-scale-in group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-6 w-6 text-accent animate-pulse" />
              <span>Featured Card</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src={premiumCardImage} 
                  alt="Premium Heritage Credit Card"
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Heritage Platinum Elite</h3>
                <Badge variant="secondary" className="bg-accent text-accent-foreground animate-pulse">
                  Premium Tier
                </Badge>
                <p className="text-muted-foreground">
                  Experience luxury banking with our premium credit card featuring exclusive benefits and unparalleled service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 stagger-fade-in">
          {creditCards.map((card, index) => (
            <Card key={index} className="banking-card hover-lift group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{card.name}</h3>
                    <Badge 
                      variant={card.tier === "Premium" ? "default" : "secondary"}
                      className={`${card.tier === "Premium" ? "bg-accent text-accent-foreground" : ""} transition-all group-hover:scale-105`}
                    >
                      {card.tier}
                    </Badge>
                  </div>
                  <CreditCard className="h-8 w-8 text-primary group-hover:animate-float" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Cashback</p>
                    <p className="text-xl font-bold text-secondary animate-balance-pulse">{card.cashback}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Credit Limit</p>
                    <p className="text-lg font-semibold transition-colors group-hover:text-primary">
                      ${card.creditLimit.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm font-medium flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-success animate-pulse" />
                    Key Features:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    {card.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center transition-transform hover:translate-x-1">
                        <Zap className="h-3 w-3 mr-2 text-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4 pt-4 border-t transition-colors group-hover:border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    Annual Fee: <span className="font-semibold text-primary">${card.annualFee}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};