import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { HeritageSVGLogoTransparent } from "./HeritageSVGLogoTransparent";
import { ServicesMenu } from "./ServicesMenu";
import { NotificationCenter } from "./NotificationCenter";
import { ProfileMenu } from "./ProfileMenu";
import { MenuIcon, CloseIcon } from "./UltraModernIcons";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BankingHeaderProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const BankingHeader = ({ activeSection, onSectionChange }: BankingHeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

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
    console.log('Notification action:', notificationId, action);
  };

  // Navigation tabs with hover effects
  const navTabs = [
    { id: 'personal', label: 'Personal', path: '/' },
    { id: 'business', label: 'Business', path: '/' },
    { id: 'wealth', label: 'Wealth', path: '/' },
    { id: 'about', label: 'About', path: '/about' },
    { id: 'contact', label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="bg-gradient-to-r from-heritage-blue via-heritage-blue-dark to-heritage-blue backdrop-blur-xl border-b border-heritage-gold/30 text-white shadow-2xl animate-slide-up sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Using new transparent SVG */}
          <Link to="/" className="flex items-center space-x-3 animate-fade-in hover:opacity-90 transition-opacity">
            <div className="relative">
              <HeritageSVGLogoTransparent 
                size="sm"
                className="w-10 h-10 lg:w-12 lg:h-12 drop-shadow-[0_0_12px_rgba(212,175,55,0.9)]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-heritage-gold/20 to-heritage-gold/10 rounded-full blur-md -z-10"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold text-heritage-gold">
                Heritage Bank
              </h1>
              <p className="text-xs lg:text-sm text-heritage-gold/80 font-medium">
                Investments & Holdings
              </p>
            </div>
          </Link>

          {/* Navigation Tabs with Hover Effects */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navTabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-300",
                  "hover:bg-heritage-gold/20 hover:text-heritage-gold",
                  hoveredTab === tab.id ? "text-heritage-gold bg-heritage-gold/10" : "text-white/90"
                )}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                {tab.label}
                {/* Animated underline on hover */}
                <span 
                  className={cn(
                    "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-heritage-gold rounded-full transition-all duration-300",
                    hoveredTab === tab.id ? "w-3/4" : "w-0"
                  )}
                />
              </Link>
            ))}
          </nav>
          
          {/* Desktop Services Menu */}
          <div className="hidden xl:flex flex-1 justify-center px-8 max-w-2xl">
            <ServicesMenu onServiceSelect={handleServiceSelect} />
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-heritage-gold hover:bg-heritage-gold/20 transition-all duration-300"
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
                <Link to="/auth">
                  <Button className="bg-heritage-gold text-heritage-blue hover:bg-heritage-gold/90 font-semibold px-6 shadow-lg hover:shadow-heritage-gold/30 transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Services Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-heritage-gold/20 bg-gradient-to-r from-heritage-blue/50 to-heritage-blue-dark/50 backdrop-blur-sm rounded-lg">
            <ServicesMenu onServiceSelect={handleServiceSelect} isMobile={true} />
          </div>
        )}
      </div>
    </header>
  );
};