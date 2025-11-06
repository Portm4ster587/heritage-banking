import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PiggyBank, 
  Landmark, 
  TrendingUp, 
  CreditCard, 
  Home,
  Building,
  Clock
} from "lucide-react";
import { BalanceMeter } from "./BalanceMeter";

const accountTypes = [
  {
    name: "Primary Checking",
    balance: 12547.83,
    accountNumber: "****-1234",
    icon: Landmark,
    changePercent: 2.5,
    isPositive: true,
    type: "checking"
  },
  {
    name: "Heritage Savings",
    balance: 45680.92,
    accountNumber: "****-5678",
    icon: PiggyBank,
    changePercent: 4.2,
    isPositive: true,
    type: "savings"
  },
  {
    name: "Investment Portfolio",
    balance: 127340.15,
    accountNumber: "****-9012",
    icon: TrendingUp,
    changePercent: -1.3,
    isPositive: false,
    type: "investment"
  },
  {
    name: "Business Account",
    balance: 89234.67,
    accountNumber: "****-3456",
    icon: Building,
    changePercent: 8.7,
    isPositive: true,
    type: "business"
  },
  {
    name: "Fixed Deposit",
    balance: 25000.00,
    accountNumber: "****-7890",
    icon: Clock,
    changePercent: 3.5,
    isPositive: true,
    type: "fixed"
  },
  {
    name: "Mortgage Account",
    balance: -342500.00,
    accountNumber: "****-2468",
    icon: Home,
    changePercent: -2.1,
    isPositive: false,
    type: "mortgage"
  }
];

export const AccountOverview = () => {
  const totalBalance = accountTypes
    .filter(account => account.type !== "mortgage")
    .reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-2">Account Overview</h2>
          <p className="text-muted-foreground">Manage your financial portfolio</p>
        </div>
        <Button className="banking-gradient-primary banking-button pulse-glow">
          <CreditCard className="mr-2 h-4 w-4" />
          Open New Account
        </Button>
      </div>

      <Card className="banking-card bg-heritage-blue text-white hover-lift animate-scale-in relative overflow-hidden border-heritage-gold/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-heritage-gold/20 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-heritage-gold/10 rounded-full -ml-12 -mb-12" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center space-x-2 text-white">
            <TrendingUp className="h-6 w-6 animate-float text-heritage-gold" />
            <span>Total Portfolio Value</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-4xl font-bold animate-balance-pulse text-white">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(totalBalance)}
          </div>
          <p className="text-white/80 mt-2">
            Across all active accounts
          </p>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-heritage-gold animate-slide-in-right" style={{ width: '75%' }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-fade-in">
        {accountTypes.map((account, index) => (
          <BalanceMeter
            key={index}
            accountName={account.name}
            balance={account.balance}
            accountNumber={account.accountNumber}
            changePercent={account.changePercent}
            isPositive={account.isPositive}
          />
        ))}
      </div>
    </div>
  );
};