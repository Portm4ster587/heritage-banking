import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import heritageLogoImage from "@/assets/heritage-logo.png";
import { ServicesMenu } from "./ServicesMenu";
import { NotificationCenter } from "./NotificationCenter";
import { ProfileMenu } from "./ProfileMenu";
import { useState } from "react";

interface BankingHeaderProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const BankingHeader = ({ activeSection, onSectionChange }: BankingHeaderProps) => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleServiceSelect = (service: string) => {
    if (onSectionChange) {
      onSectionChange(service);
    }
    setIsMobileMenuOpen(false);
  };

  const handleProfileAction = (action: string) => {
    if (onSectionChange) {
      onSectionChange(action);
    }
  };

  const handleNotificationAction = (notificationId: string, action: string) => {
    // Handle notification actions here
    console.log('Notification action:', notificationId, action);
  };

  return (
    <header className="banking-gradient-primary text-primary-foreground shadow-lg border-b animate-slide-up sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 animate-fade-in">
            <img 
              src={heritageLogoImage} 
              alt="Heritage Bank Logo" 
              className="h-8 w-8 lg:h-10 lg:w-10 animate-float"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold">Heritage Bank</h1>
              <p className="text-xs lg:text-sm text-primary-foreground/80">Your Financial Partner Since 1892</p>
            </div>
          </div>
          
          {/* Desktop Services Menu */}
          <div className="hidden lg:flex flex-1 justify-center px-8">
            <ServicesMenu onServiceSelect={handleServiceSelect} />
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-primary-foreground hover:bg-primary-light"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            {/* Notifications */}
            <NotificationCenter onNotificationAction={handleNotificationAction} />
            
            {/* Profile Menu */}
            <ProfileMenu onMenuAction={handleProfileAction} />
          </div>
        </div>
        
        {/* Mobile Services Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-primary-foreground/20">
            <ServicesMenu onServiceSelect={handleServiceSelect} isMobile={true} />
          </div>
        )}
      </div>
    </header>
  );
};