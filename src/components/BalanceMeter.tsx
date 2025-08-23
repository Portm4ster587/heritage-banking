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
    <Card className="banking-card banking-shadow hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {accountName}
        </CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">
          {formatCurrency(balance)}
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Account: {accountNumber}
        </p>
        
        <div className="flex items-center space-x-2 text-xs">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
          <span className={isPositive ? "text-success" : "text-destructive"}>
            {isPositive ? "+" : ""}{changePercent}%
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
        
        <Progress 
          value={75} 
          className="mt-3" 
        />
      </CardContent>
    </Card>
  );
};