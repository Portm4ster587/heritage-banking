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
        <Card className="md:col-span-2 overflow-hidden relative bg-heritage-blue border-heritage-gold/20">
          <div className="absolute inset-0 bg-gradient-to-br from-heritage-gold/10 via-transparent to-heritage-gold/5 pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center justify-between text-white">
              <span>Total Balance</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleBalance}
                className="text-white hover:text-heritage-gold hover:bg-white/10"
              >
                {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-2 text-white">
              {balanceVisible ? `$${totalBalance.toLocaleString()}` : '••••••••'}
            </div>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-heritage-gold" />
                <span className="text-white">+2.1% this month</span>
              </div>
              <div className="text-white/80">Last updated: just now</div>
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
          <Card key={account.id} className="hover:shadow-lg transition-shadow bg-heritage-blue border-heritage-gold/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg capitalize text-white">
                  {account.account_type
                    .replace('_', ' ')
                    .replace('personal checking', 'Heritage Checking')
                    .replace('personal savings', 'Heritage Savings')
                    .replace('business savings', 'Business Savings')
                    .replace('loan account', 'Loan Account')}
                </CardTitle>
                <Badge variant={account.status === 'active' ? 'default' : 'secondary'} className="bg-heritage-gold text-heritage-blue">
                  {account.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Available Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {balanceVisible ? `$${(account.balance ?? 0).toLocaleString()}` : '••••••'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleBalance}
                  className="text-white hover:text-heritage-gold hover:bg-white/10"
                >
                  {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <div className="pt-2 border-t border-heritage-gold/20">
                <p className="text-xs text-white/60">Account Number</p>
                <p className="text-sm font-mono text-white">{account.account_number}</p>
                <p className="text-xs text-white/60 mt-1">Routing Number</p>
                <p className="text-sm font-mono text-white">{account.routing_number}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
