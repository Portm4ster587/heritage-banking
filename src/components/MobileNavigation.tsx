import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home,
  ArrowRightLeft,
  CreditCard,
  Clock,
  MoreHorizontal,
  X,
  Wallet,
  Settings,
  Smartphone,
  Shield,
  Receipt,
  Bitcoin,
  FileText,
  ArrowDownToLine,
  ArrowUpFromLine
} from 'lucide-react';
import { useState } from 'react';

interface MobileNavigationProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const navItems = [
  { id: 'accounts', label: 'Home', icon: Home, route: '/dashboard' },
  { id: 'transfers', label: 'Transfer', icon: ArrowRightLeft, route: '/dashboard/transfers' },
  { id: 'cards', label: 'Cards', icon: CreditCard, route: '/dashboard/cards' },
  { id: 'history', label: 'Activity', icon: Clock, route: '/dashboard/history' },
];

const moreItems = [
  { id: 'topup', label: 'Deposit', icon: ArrowDownToLine, route: '/dashboard/topup' },
  { id: 'withdraw', label: 'Withdraw', icon: ArrowUpFromLine, route: '/dashboard/withdraw' },
  { id: 'crypto', label: 'Crypto', icon: Bitcoin, route: '/dashboard/crypto' },
  { id: 'bills', label: 'Pay Bills', icon: Receipt, route: '/dashboard/bills' },
  { id: 'statements', label: 'Statements', icon: FileText, route: '/dashboard/statements' },
  { id: 'settings', label: 'Settings', icon: Settings, route: '/dashboard/settings' },
  { id: 'kyc', label: 'ID Verify', icon: Shield, route: '/dashboard/idme' },
  { id: 'mobile', label: 'Mobile Check', icon: Smartphone, route: '/dashboard/topup' },
];

export const MobileNavigation = ({ activeSection, onSectionChange }: MobileNavigationProps) => {
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (item: typeof navItems[0]) => {
    if (activeSection) return activeSection === item.id;
    return location.pathname === item.route;
  };

  const handleNav = (item: typeof navItems[0]) => {
    if (onSectionChange) {
      onSectionChange(item.id);
    } else {
      navigate(item.route);
    }
    setShowMore(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 
        bg-card/95 backdrop-blur-xl border-t border-border
        pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-stretch">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item)}
                className="flex-1 flex flex-col items-center pt-2 pb-1.5 gap-0.5 relative transition-colors"
              >
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
                <Icon className={`w-5 h-5 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] font-medium transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setShowMore(true)}
            className="flex-1 flex flex-col items-center pt-2 pb-1.5 gap-0.5"
          >
            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">More</span>
          </button>
        </div>
      </div>

      {/* More Menu Sheet */}
      {showMore && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setShowMore(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl shadow-2xl border-t border-border animate-slide-up
            pb-[env(safe-area-inset-bottom)]">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-5 pb-3">
              <h3 className="text-base font-semibold">More Services</h3>
              <button onClick={() => setShowMore(false)} className="p-1 rounded-full hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-y-5 gap-x-2 px-5 pb-6">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item)}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center 
                      group-hover:bg-primary/10 group-active:scale-95 transition-all">
                      <Icon className="w-5 h-5 text-foreground/70 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground group-hover:text-primary">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
