import { useState } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  Wallet, 
  Building, 
  FileText, 
  PiggyBank, 
  Send, 
  Smartphone,
  MoreHorizontal,
  ArrowUpRight,
  Calculator,
  Home,
  Car
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ServicesMenuProps {
  onServiceSelect?: (service: string) => void;
  isMobile?: boolean;
}

export const ServicesMenu = ({ onServiceSelect, isMobile = false }: ServicesMenuProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const serviceCategories = {
    banking: {
      title: 'Banking Services',
      icon: Building,
      color: 'text-primary',
      services: [
        { id: 'accounts', title: 'Account Overview', description: 'View all accounts', icon: Wallet },
        { id: 'transfers', title: 'Transfers', description: 'Send money anywhere', icon: Send },
        { id: 'statements', title: 'Statements', description: 'Download statements', icon: FileText },
        { id: 'topup', title: 'Account Top-Up', description: 'Add funds to account', icon: TrendingUp },
      ]
    },
    cards: {
      title: 'Cards & Credit',
      icon: CreditCard,
      color: 'text-secondary',
      services: [
        { id: 'cards', title: 'Credit Cards', description: 'Manage credit cards', icon: CreditCard },
        { id: 'card-generate', title: 'Generate Card', description: 'Create new cards', icon: Smartphone },
        { id: 'card-management', title: 'Card Management', description: 'Control card settings', icon: MoreHorizontal },
      ]
    },
    crypto: {
      title: 'Crypto & Investment',
      icon: TrendingUp,
      color: 'text-accent',
      services: [
        { id: 'crypto', title: 'Crypto Wallet', description: 'Digital assets', icon: Wallet },
        { id: 'crypto-exchange', title: 'Exchange', description: 'Trade cryptocurrencies', icon: ArrowUpRight },
        { id: 'crypto-rates', title: 'Live Rates', description: 'Real-time prices', icon: TrendingUp },
      ]
    },
    loans: {
      title: 'Loans & Mortgages',
      icon: Calculator,
      color: 'text-warning',
      services: [
        { id: 'personal-loan', title: 'Personal Loans', description: 'Quick approval loans', icon: FileText },
        { id: 'home-loan', title: 'Home Loans', description: 'Mortgage solutions', icon: Home },
        { id: 'auto-loan', title: 'Auto Loans', description: 'Vehicle financing', icon: Car },
        { id: 'business-loan', title: 'Business Loans', description: 'Business financing', icon: Building },
      ]
    },
    savings: {
      title: 'Savings & Investment',
      icon: PiggyBank,
      color: 'text-success',
      services: [
        { id: 'savings', title: 'Savings Account', description: 'High yield savings', icon: PiggyBank },
        { id: 'fixed-deposit', title: 'Fixed Deposit', description: 'Secure investments', icon: TrendingUp },
        { id: 'investment', title: 'Investment Plans', description: 'Wealth management', icon: ArrowUpRight },
      ]
    }
  };

  const handleServiceClick = (serviceId: string) => {
    onServiceSelect?.(serviceId);
  };

  if (isMobile) {
    return (
      <div className="grid grid-cols-2 gap-3 p-4">
        {Object.entries(serviceCategories).map(([key, category]) => (
          <Card key={key} className="banking-card cursor-pointer hover-lift" onClick={() => setActiveCategory(activeCategory === key ? null : key)}>
            <CardContent className="p-4 text-center">
              <category.icon className={`w-6 h-6 mx-auto mb-2 ${category.color}`} />
              <p className="text-sm font-medium">{category.title}</p>
            </CardContent>
          </Card>
        ))}
        
        {activeCategory && (
          <div className="col-span-2 mt-4 space-y-2">
            <h4 className="font-semibold text-foreground mb-3">
              {serviceCategories[activeCategory as keyof typeof serviceCategories].title}
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {serviceCategories[activeCategory as keyof typeof serviceCategories].services.map((service) => (
                <Button
                  key={service.id}
                  variant="ghost"
                  className="justify-start h-auto p-3"
                  onClick={() => handleServiceClick(service.id)}
                >
                  <service.icon className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">{service.title}</p>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <NavigationMenu className="max-w-none">
      <NavigationMenuList className="flex-wrap">
        {Object.entries(serviceCategories).map(([key, category]) => (
          <NavigationMenuItem key={key}>
            <NavigationMenuTrigger className={cn("bg-background hover:bg-accent/50", category.color)}>
              <category.icon className="w-4 h-4 mr-2" />
              {category.title}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[600px] gap-3 p-6 md:w-[500px] lg:w-[600px]">
                <div className="row-span-3">
                  <NavigationMenuLink asChild>
                    <div className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                      <div className="mb-2 mt-4 text-lg font-medium">
                        {category.title}
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Complete suite of {category.title.toLowerCase()} solutions for your financial needs.
                      </p>
                    </div>
                  </NavigationMenuLink>
                </div>
                <div className="grid gap-2">
                  {category.services.map((service) => (
                    <NavigationMenuLink key={service.id} asChild>
                      <Button
                        variant="ghost"
                        className="justify-start h-auto p-3 hover:bg-muted/50"
                        onClick={() => handleServiceClick(service.id)}
                      >
                        <service.icon className="w-4 h-4 mr-3 text-muted-foreground" />
                        <div className="text-left">
                          <div className="text-sm font-medium">{service.title}</div>
                          <p className="text-xs text-muted-foreground">{service.description}</p>
                        </div>
                      </Button>
                    </NavigationMenuLink>
                  ))}
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};