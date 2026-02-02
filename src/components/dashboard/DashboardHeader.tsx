import { useState, useEffect } from 'react';
import { User, Settings, LogOut, Shield, CreditCard, FileText, Bell, HelpCircle, Wallet, ArrowLeftRight, Bitcoin, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatedHeritageLogo } from '@/components/AnimatedHeritageLogo';
import { MobileNavMenu } from '@/components/MobileNavMenu';
import { NotificationCenter } from '@/components/NotificationCenter';

interface DashboardHeaderProps {
  onSectionChange?: (section: string) => void;
}

export const DashboardHeader = ({ onSectionChange }: DashboardHeaderProps) => {
  const { user, signOut, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*, avatar_url')
        .eq('user_id', user?.id)
        .maybeSingle();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const userData = {
    firstName: profile?.first_name || user?.email?.split('@')[0] || 'User',
    lastName: profile?.last_name || '',
    email: user?.email || '',
    accountType: 'Heritage Business',
    memberSince: profile?.created_at ? new Date(profile.created_at).getFullYear().toString() : '2024',
    avatar: profile?.avatar_url || undefined
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account."
    });
    setIsOpen(false);
    navigate('/');
  };

  const handleMenuClick = (action: string) => {
    if (onSectionChange) {
      onSectionChange(action);
    }
    setIsOpen(false);
    
    // Handle specific navigation
    if (action === 'admin') {
      navigate('/admin-dashboard');
    } else if (action === 'profile') {
      navigate('/dashboard/profile');
    } else if (action === 'settings') {
      navigate('/dashboard/settings');
    }
  };

  const getUserInitials = () => {
    const first = userData.firstName?.[0] || '';
    const last = userData.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <AnimatedHeritageLogo size="sm" isActive={true} variant="loading" />
            <div>
              <span className="text-xl font-bold text-heritage-blue">HERITAGE</span>
              <p className="text-xs text-heritage-blue/70">BANK</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/dashboard" className="text-heritage-blue font-medium border-b-2 border-heritage-blue pb-4 hover:text-heritage-blue-dark transition-colors">
              Accounts
            </Link>
            <Link to="/dashboard/transfers" className="text-muted-foreground hover:text-foreground pb-4 transition-colors">
              Transfer
            </Link>
            <Link to="/dashboard/topup" className="text-muted-foreground hover:text-foreground pb-4 transition-colors">
              Deposit
            </Link>
            <Link to="/dashboard/withdraw" className="text-muted-foreground hover:text-foreground pb-4 transition-colors">
              Withdraw
            </Link>
            <Link to="/dashboard/crypto" className="text-muted-foreground hover:text-foreground pb-4 transition-colors">
              Crypto
            </Link>
            <Link to="/dashboard/history" className="text-muted-foreground hover:text-foreground pb-4 transition-colors">
              History
            </Link>
            <Link to="/dashboard/settings" className="text-muted-foreground hover:text-foreground pb-4 transition-colors">
              Settings
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <MobileNavMenu />
            
            <NotificationCenter onNotificationAction={() => {}} />
            
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={userData.avatar} alt={`${userData.firstName} ${userData.lastName}`} />
                    <AvatarFallback className="bg-heritage-blue text-white font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={userData.avatar} alt={`${userData.firstName} ${userData.lastName}`} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-base font-semibold leading-none">
                          {userData.firstName} {userData.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {userData.email}
                        </p>
                        <p className="text-xs text-primary mt-1 font-medium">
                          {userData.accountType}
                        </p>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuGroup>
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => handleMenuClick('profile')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <div className="flex-1">
                      <div className="text-sm">My Profile</div>
                      <div className="text-xs text-muted-foreground">View complete account information</div>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => handleMenuClick('settings')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <div className="flex-1">
                      <div className="text-sm">Account Settings</div>
                      <div className="text-xs text-muted-foreground">Security & preferences</div>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => handleMenuClick('cards')}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    <div className="flex-1">
                      <div className="text-sm">My Cards</div>
                      <div className="text-xs text-muted-foreground">Manage credit & debit cards</div>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => handleMenuClick('accounts')}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    <div className="flex-1">
                      <div className="text-sm">My Accounts</div>
                      <div className="text-xs text-muted-foreground">View all accounts</div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => handleMenuClick('transfers')}
                  >
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    <div className="flex-1">
                      <div className="text-sm">Transfers</div>
                      <div className="text-xs text-muted-foreground">Send & receive money</div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => handleMenuClick('crypto')}
                  >
                    <Bitcoin className="mr-2 h-4 w-4" />
                    <div className="flex-1">
                      <div className="text-sm">Crypto</div>
                      <div className="text-xs text-muted-foreground">Digital assets & wallets</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuGroup>
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => handleMenuClick('statements')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Statements & Documents</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => handleMenuClick('security')}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Security Center</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => handleMenuClick('notifications')}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notification Preferences</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-primary"
                      onClick={() => handleMenuClick('admin')}
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => handleMenuClick('help')}
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <div className="px-2 py-1">
                  <p className="text-xs text-muted-foreground text-center">
                    Member since {userData.memberSince} • FDIC Insured
                  </p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
