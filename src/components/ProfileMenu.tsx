import { useState, useEffect } from 'react';
import { User, Settings, LogOut, Shield, CreditCard, FileText, Bell, HelpCircle, Wallet } from 'lucide-react';
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
import { UserProfileModal } from './UserProfileModal';

interface ProfileMenuProps {
  onMenuAction?: (action: string) => void;
}

export const ProfileMenu = ({ onMenuAction }: ProfileMenuProps) => {
  const { user, signOut, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
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
  };

  const handleMenuClick = (action: string) => {
    onMenuAction?.(action);
    setIsOpen(false);
  };

  const getUserInitials = () => {
    return `${userData.firstName[0]}${userData.lastName[0]}`;
  };

  return (
    <>
      <UserProfileModal 
        open={showProfileModal} 
        onOpenChange={setShowProfileModal}
        onNavigateToSettings={() => handleMenuClick('settings')}
      />
      
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full text-primary-foreground hover:bg-primary-light">
            <Avatar className="h-9 w-9">
              <AvatarImage src={userData.avatar} alt={`${userData.firstName} ${userData.lastName}`} />
              <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
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
            onClick={() => {
              setIsOpen(false);
              setShowProfileModal(true);
            }}
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
              <Settings className="mr-2 h-4 w-4" />
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
    </>
  );
};