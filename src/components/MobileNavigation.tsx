import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Home,
  ArrowRightLeft,
  CreditCard,
  Wallet,
  Settings,
  Menu,
  X 
} from 'lucide-react';

interface MobileNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const MobileNavigation = ({ activeSection, onSectionChange }: MobileNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const mobileNavItems = [
    { id: 'accounts', label: 'Accounts', icon: Home },
    { id: 'transfers', label: 'Transfers', icon: ArrowRightLeft },
    { id: 'cards', label: 'Cards', icon: CreditCard },
    { id: 'crypto', label: 'Crypto', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (section: string) => {
    onSectionChange(section);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground border-t z-40">
        <div className="flex justify-around items-center py-2">
          {mobileNavItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-light text-accent scale-110' 
                    : 'hover:bg-primary-light/50'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center p-2 rounded-lg hover:bg-primary-light/50 transition-all duration-200"
          >
            <Menu className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="w-full max-w-sm mx-4 bg-card rounded-xl shadow-xl animate-scale-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Navigation</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {mobileNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex flex-col items-center p-4 rounded-lg border transition-all duration-200 hover:scale-105 ${
                        isActive 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'hover:bg-muted/50 border-border'
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handleNavClick('topup')}
                  className="flex flex-col items-center p-4 rounded-lg border hover:bg-muted/50 border-border transition-all duration-200 hover:scale-105"
                >
                  <Smartphone className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Top Up</span>
                </button>
                
                <button
                  onClick={() => handleNavClick('kyc')}
                  className="flex flex-col items-center p-4 rounded-lg border hover:bg-muted/50 border-border transition-all duration-200 hover:scale-105"
                >
                  <Settings className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">ID Verify</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};