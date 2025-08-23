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

export const BankingHeader = () => {
  return (
    <header className="banking-gradient-primary text-primary-foreground shadow-lg border-b animate-slide-up">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 animate-fade-in">
            <Building2 className="h-8 w-8 animate-float" />
            <div>
              <h1 className="text-xl font-bold">US Heritage & Investments Bank</h1>
              <p className="text-sm text-primary-foreground/80">Your Financial Partner Since 1892</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="banking-link hover:text-accent-light transition-all duration-300 hover:scale-105">Accounts</a>
            <a href="#" className="banking-link hover:text-accent-light transition-all duration-300 hover:scale-105">Transfers</a>
            <a href="#" className="banking-link hover:text-accent-light transition-all duration-300 hover:scale-105">Investments</a>
            <a href="#" className="banking-link hover:text-accent-light transition-all duration-300 hover:scale-105">Credit Cards</a>
            <a href="#" className="banking-link hover:text-accent-light transition-all duration-300 hover:scale-105">Loans</a>
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
                <DropdownMenuLabel>John Smith</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-muted transition-colors">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-muted transition-colors">
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