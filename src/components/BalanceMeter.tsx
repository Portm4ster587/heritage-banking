import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface BalanceMeterProps {
  accountName: string;
  balance: number;
  accountNumber: string;
  changePercent: number;
  isPositive: boolean;
}

export const BalanceMeter = ({ 
  accountName, 
  balance, 
  accountNumber, 
  changePercent, 
  isPositive 
}: BalanceMeterProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card className="banking-card banking-shadow hover-lift border-l-4 border-l-primary animate-fade-in group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
          {accountName}
        </CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:animate-pulse" />
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold text-primary animate-balance-pulse group-hover:animate-none transition-all duration-300">
          {formatCurrency(balance)}
        </div>
        <p className="text-xs text-muted-foreground mb-4 opacity-75 group-hover:opacity-100 transition-opacity">
          Account: {accountNumber}
        </p>
        
        <div className="flex items-center space-x-2 text-xs animate-slide-up">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-success animate-pulse" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive animate-pulse" />
          )}
          <span className={`font-semibold ${isPositive ? "text-success" : "text-destructive"}`}>
            {isPositive ? "+" : ""}{changePercent}%
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
        
        <div className="mt-3 space-y-2">
          <Progress 
            value={75} 
            className="transition-all duration-500 hover:shadow-sm" 
          />
          <div className="h-1 w-full bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardContent>
    </Card>
  );
};