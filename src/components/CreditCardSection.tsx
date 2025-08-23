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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary">Credit Cards</h2>
          <p className="text-muted-foreground">Choose the perfect card for your lifestyle</p>
        </div>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
          Apply Now
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="banking-card overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-6 w-6 text-accent" />
              <span>Featured Card</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <img 
                src={premiumCardImage} 
                alt="Premium Heritage Credit Card"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Heritage Platinum Elite</h3>
                <Badge variant="secondary" className="bg-accent text-accent-foreground">
                  Premium Tier
                </Badge>
                <p className="text-muted-foreground">
                  Experience luxury banking with our premium credit card featuring exclusive benefits and unparalleled service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {creditCards.map((card, index) => (
            <Card key={index} className="banking-card hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{card.name}</h3>
                    <Badge 
                      variant={card.tier === "Premium" ? "default" : "secondary"}
                      className={card.tier === "Premium" ? "bg-accent text-accent-foreground" : ""}
                    >
                      {card.tier}
                    </Badge>
                  </div>
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cashback</p>
                    <p className="text-xl font-bold text-secondary">{card.cashback}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Credit Limit</p>
                    <p className="text-lg font-semibold">
                      ${card.creditLimit.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-success" />
                    Key Features:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {card.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <Zap className="h-3 w-3 mr-2 text-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Annual Fee: <span className="font-semibold">${card.annualFee}</span>
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