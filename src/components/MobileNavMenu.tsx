import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, Home, Send, Download, Upload, Bitcoin, History, Settings } from 'lucide-react';

export function MobileNavMenu() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/transfers', icon: Send, label: 'Transfer' },
    { href: '/dashboard/topup', icon: Download, label: 'Deposit' },
    { href: '/dashboard/withdraw', icon: Upload, label: 'Withdraw' },
    { href: '/dashboard/crypto', icon: Bitcoin, label: 'Crypto' },
    { href: '/dashboard/history', icon: History, label: 'History' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle className="text-heritage-blue">Navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-2 mt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
