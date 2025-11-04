import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, TrendingUp, Plus } from "lucide-react";

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  status: string;
  balance: number;
  routing_number: string;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
}

interface AccountOverviewSectionProps {
  accounts: Account[];
  balanceVisible: boolean;
  onToggleBalance: () => void;
  onOpenNewAccount: () => void;
}

export const AccountOverviewSection = ({ 
  accounts, 
  balanceVisible, 
  onToggleBalance,
  onOpenNewAccount 
}: AccountOverviewSectionProps) => {
  const totalBalance = accounts.reduce((sum, account) => sum + (account.balance ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center justify-between">
              <span>Total Balance</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleBalance}
              >
                {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-2">
              {balanceVisible ? `$${totalBalance.toLocaleString()}` : '••••••••'}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-success" />
                <span>+2.1% this month</span>
              </div>
              <div>Last updated: just now</div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.length}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Accounts List */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Accounts</h2>
        <Button 
          className="gap-2"
          onClick={onOpenNewAccount}
        >
          <Plus className="w-4 h-4" />
          Open New Account
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((account) => (
          <Card key={account.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg capitalize">
                  {account.account_type
                    .replace('_', ' ')
                    .replace('personal checking', 'Heritage Checking')
                    .replace('personal savings', 'Heritage Savings')
                    .replace('business savings', 'Business Savings')
                    .replace('loan account', 'Loan Account')}
                </CardTitle>
                <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                  {account.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold">
                    {balanceVisible ? `$${(account.balance ?? 0).toLocaleString()}` : '••••••'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleBalance}
                >
                  {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
