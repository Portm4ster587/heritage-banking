import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  CreditCard, 
  Landmark, 
  PiggyBank, 
  Building,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  status: string;
  balance: number;
  routing_number: string;
}

interface AccountDetailsPanelProps {
  account: Account;
  balanceVisible: boolean;
}

export const AccountDetailsPanel = ({ account, balanceVisible }: AccountDetailsPanelProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'personal_checking':
        return Landmark;
      case 'personal_savings':
        return PiggyBank;
      case 'business':
        return Building;
      default:
        return CreditCard;
    }
  };

  const getAccountDisplayName = (accountType: string) => {
    switch (accountType) {
      case 'personal_checking':
        return 'Heritage Checking';
      case 'personal_savings':
        return 'Heritage Savings';
      case 'business':
        return 'Business Account';
      default:
        return accountType.replace('_', ' ');
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const IconComponent = getAccountIcon(account.account_type);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
      <CardContent className="p-0">
        {/* Main Account Row */}
        <div 
          className="p-6 flex items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                {getAccountDisplayName(account.account_type)}
              </h3>
              <p className="text-sm text-slate-500">
                ••••{account.account_number.slice(-4)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-lg font-semibold text-slate-900">
                {balanceVisible ? `$${account.balance.toLocaleString()}` : '••••••'}
              </p>
              <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                {account.status}
              </Badge>
            </div>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="border-t border-slate-100 bg-slate-50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-slate-700">Account Details</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(!showDetails);
                }}
              >
                {showDetails ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Show
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account Number */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Account Number</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-lg">
                    {showDetails ? account.account_number : '•••• •••• ' + account.account_number.slice(-4)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(account.account_number, 'account');
                    }}
                  >
                    {copied === 'account' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Routing Number */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Routing Number</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-lg">
                    {showDetails ? account.routing_number : '•••••••••'}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(account.routing_number, 'routing');
                    }}
                  >
                    {copied === 'routing' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Bank Info */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-heritage-gold" />
                <div>
                  <p className="text-xs text-slate-500">Bank Name</p>
                  <p className="font-semibold">Heritage Bank US</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard/transfers">Transfer Money</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard/topup">Make Deposit</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard/history">View History</a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
