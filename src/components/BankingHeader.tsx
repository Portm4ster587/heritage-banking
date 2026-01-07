import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { HeritageSVGLogoTransparent } from "./HeritageSVGLogoTransparent";
import { ServicesMenu } from "./ServicesMenu";
import { NotificationCenter } from "./NotificationCenter";
import { ProfileMenu } from "./ProfileMenu";
import { MenuIcon, CloseIcon } from "./UltraModernIcons";
import { useState } from "react";
import { Link } from "react-router-dom";

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
    <header className="bg-gradient-to-r from-background via-muted to-background backdrop-blur-xl border-b border-primary/20 text-foreground shadow-neon animate-slide-up sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Using new transparent SVG */}
          <Link to="/" className="flex items-center space-x-3 animate-fade-in hover:opacity-90 transition-opacity">
            <div className="relative">
              <HeritageSVGLogoTransparent 
                size="sm"
                className="w-10 h-10 lg:w-12 lg:h-12 drop-shadow-[0_0_12px_rgba(212,175,55,0.9)]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-md -z-10"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-primary-foreground to-accent bg-clip-text text-transparent">
                Heritage Bank
              </h1>
              <p className="text-xs lg:text-sm text-primary-foreground/90 font-medium">
                Ultra-Modern Banking Solutions
              </p>
            </div>
          </Link>
          
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
              className="lg:hidden text-foreground hover:bg-muted/50 hover:shadow-neon transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? 
                <CloseIcon size={20} glowEffect={true} /> : 
                <MenuIcon size={20} glowEffect={true} />
              }
            </Button>
            {user ? (
              <>
                {/* Notifications */}
                <NotificationCenter onNotificationAction={handleNotificationAction} />
                {/* Profile Menu */}
                <ProfileMenu onMenuAction={handleProfileAction} />
              </>
            ) : (
              <>
                <a href="/auth">
                  <Button className="banking-button">Sign In</Button>
                </a>
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Services Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-primary/20 bg-gradient-to-r from-muted/30 to-background/30 backdrop-blur-sm rounded-lg">
            <ServicesMenu onServiceSelect={handleServiceSelect} isMobile={true} />
          </div>
        )}
      </div>
    </header>
  );
};