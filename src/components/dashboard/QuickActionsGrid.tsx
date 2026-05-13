import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  CreditCard, 
  FileText, 
  Receipt,
  Bitcoin,
  Globe,
  Landmark,
  QrCode,
  Smartphone,
  MoreHorizontal,
  Repeat,
  Briefcase,
  PieChart,
  Network
} from 'lucide-react';
import { useState } from 'react';

interface QuickActionsGridProps {
  onSectionChange?: (section: string) => void;
}

const primaryActions = [
  { id: 'transfers', label: 'Send', icon: Send, route: '/dashboard/transfers' },
  { id: 'topup', label: 'Deposit', icon: ArrowDownToLine, route: '/dashboard/topup' },
  { id: 'withdraw', label: 'Withdraw', icon: ArrowUpFromLine, route: '/dashboard/withdraw' },
  { id: 'bills', label: 'Pay Bills', icon: Receipt, route: '/dashboard/bills' },
  { id: 'cards', label: 'Cards', icon: CreditCard, route: '/dashboard/cards' },
  { id: 'crypto', label: 'Crypto', icon: Bitcoin, route: '/dashboard/crypto' },
];

const moreActions = [
  { id: 'cross-bank', label: 'Cross-Bank', icon: Network, route: '/dashboard/transfers' },
  { id: 'recurring', label: 'Recurring', icon: Repeat, route: '/dashboard/recurring' },
  { id: 'investments', label: 'Invest', icon: Briefcase, route: '/dashboard/investments' },
  { id: 'budgeting', label: 'Budget', icon: PieChart, route: '/dashboard/budgeting' },
  { id: 'external-transfer', label: 'Wire', icon: Globe, route: '/dashboard/transfers' },
  { id: 'statements', label: 'Statements', icon: FileText, route: '/dashboard/statements' },
  { id: 'wallet-qr', label: 'QR Pay', icon: QrCode, route: '/dashboard/crypto' },
  { id: 'topup-mobile', label: 'Mobile', icon: Smartphone, route: '/dashboard/topup' },
  { id: 'merchant', label: 'Merchants', icon: Landmark, route: '/dashboard/bills' },
];

export const QuickActionsGrid = ({ onSectionChange }: QuickActionsGridProps) => {
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const handleAction = (action: typeof primaryActions[0]) => {
    if (onSectionChange) {
      onSectionChange(action.id);
    } else {
      navigate(action.route);
    }
  };

  return (
    <div className="space-y-4">
      {/* Primary Actions - Chase-style circular icons */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {primaryActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center 
                group-hover:bg-primary group-hover:text-primary-foreground 
                group-active:scale-95
                transition-all duration-200 border border-primary/20 group-hover:border-primary
                group-hover:shadow-md">
                <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <span className="text-xs font-medium text-foreground/80 group-hover:text-primary transition-colors">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* More Actions Toggle */}
      <button 
        onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-2 text-sm text-primary font-medium mx-auto hover:underline"
      >
        <MoreHorizontal className="w-4 h-4" />
        {showMore ? 'Show less' : 'More services'}
      </button>

      {/* Expanded Actions */}
      {showMore && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 animate-fade-in">
          {moreActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center 
                  group-hover:bg-primary/10 
                  group-active:scale-95
                  transition-all duration-200 border border-border group-hover:border-primary/30">
                  <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
