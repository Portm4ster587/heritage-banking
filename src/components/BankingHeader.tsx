import { Building2, User, Bell, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import heritageLogoImage from "@/assets/heritage-logo.png";

interface BankingHeaderProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const BankingHeader = ({ activeSection, onSectionChange }: BankingHeaderProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out."
    });
  };

  const handleNavClick = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  return (
    <header className="banking-gradient-primary text-primary-foreground shadow-lg border-b animate-slide-up">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 animate-fade-in">
            <img 
              src={heritageLogoImage} 
              alt="Heritage Bank Logo" 
              className="h-10 w-10 animate-float"
            />
            <div>
              <h1 className="text-xl font-bold">Heritage Bank</h1>
              <p className="text-sm text-primary-foreground/80">Your Financial Partner Since 1892</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleNavClick('accounts')}
              className={`banking-link hover:text-accent-light transition-all duration-300 hover:scale-105 ${activeSection === 'accounts' ? 'text-accent-light' : ''}`}
            >
              Accounts
            </button>
            <button 
              onClick={() => handleNavClick('transfers')}
              className={`banking-link hover:text-accent-light transition-all duration-300 hover:scale-105 ${activeSection === 'transfers' ? 'text-accent-light' : ''}`}
            >
              Transfers
            </button>
            <button 
              onClick={() => handleNavClick('crypto')}
              className={`banking-link hover:text-accent-light transition-all duration-300 hover:scale-105 ${activeSection === 'crypto' ? 'text-accent-light' : ''}`}
            >
              Crypto Wallet
            </button>
            <button 
              onClick={() => handleNavClick('cards')}
              className={`banking-link hover:text-accent-light transition-all duration-300 hover:scale-105 ${activeSection === 'cards' ? 'text-accent-light' : ''}`}
            >
              Credit Cards
            </button>
            <button 
              onClick={() => handleNavClick('statements')}
              className={`banking-link hover:text-accent-light transition-all duration-300 hover:scale-105 ${activeSection === 'statements' ? 'text-accent-light' : ''}`}
            >
              Statements
            </button>
            <button 
              onClick={() => handleNavClick('topup')}
              className={`banking-link hover:text-accent-light transition-all duration-300 hover:scale-105 ${activeSection === 'topup' ? 'text-accent-light' : ''}`}
            >
              Top-Up
            </button>
          </nav>
          
          <div className="flex items-center space-x-4 animate-fade-in">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-light banking-button">
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-light banking-button">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                <DropdownMenuLabel>{user?.email || 'User'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="hover:bg-muted transition-colors"
                  onClick={() => handleNavClick('profile')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-muted transition-colors"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};