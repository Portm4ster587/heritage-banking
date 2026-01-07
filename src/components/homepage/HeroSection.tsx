import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { HeritageSVGLogoTransparent } from "../HeritageSVGLogoTransparent";
import { Shield, CreditCard, Landmark, ArrowRight } from "lucide-react";
import bankingHeroImage from "@/assets/banking-hero.jpg";
import cardsShowcaseImage from "@/assets/cards-showcase.jpg";
import bankInterior1 from "@/assets/bank-interior-1.jpg";
import bankInterior2 from "@/assets/bank-interior-2.jpg";
import heritageAtmImage from "@/assets/heritage-atm.jpg";
import heritageAtmImage2 from "@/assets/heritage-atm-2.png";

interface HeroSectionProps {
  user: any;
  onOpenCards: () => void;
  onOpenApplication: () => void;
}

export const HeroSection = ({ user, onOpenCards, onOpenApplication }: HeroSectionProps) => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  
  const backgroundImages = [
    bankingHeroImage,
    cardsShowcaseImage,
    bankInterior1,
    bankInterior2,
    heritageAtmImage,
    heritageAtmImage2
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="min-h-[600px] lg:min-h-[700px] relative animate-fade-in flex items-center py-8 lg:py-12">
        {/* Background Slideshow */}
        {backgroundImages.map((bg, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000 bg-cover bg-center"
            style={{
              backgroundImage: `url(${bg})`,
              opacity: currentBgIndex === index ? 1 : 0,
              filter: 'contrast(1.15) saturate(1.25) brightness(1.05)',
            }}
          />
        ))}
        
        <div className="absolute inset-0 bg-gradient-to-r from-heritage-blue/95 via-heritage-blue/90 to-heritage-blue-dark/95"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-heritage-gold/20 rounded-full blur-xl animate-float hidden sm:block"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-heritage-gold/10 rounded-full blur-lg animate-float hidden sm:block" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-heritage-gold/15 rounded-full blur-md animate-float hidden lg:block" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative container mx-auto px-4 sm:px-6">
          {/* Top Header with SVG Logo */}
          <div className="flex items-center space-x-3 sm:space-x-4 mb-6 lg:mb-8 animate-slide-up">
            <HeritageSVGLogoTransparent size="lg" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 drop-shadow-[0_0_20px_rgba(212,175,55,0.9)]" />
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold animate-fade-in text-heritage-gold tracking-wider">
                HERITAGE
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-heritage-gold/90 tracking-widest">BANK</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Welcome Text */}
            <div className="text-white space-y-4 lg:space-y-6 animate-slide-up">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 lg:mb-4 animate-fade-in leading-tight">
                Banking Excellence <br className="hidden sm:block" />Since 1892
              </h2>
              <p className="text-base lg:text-xl mb-6 lg:mb-8 text-white/90 animate-fade-in leading-relaxed max-w-xl" style={{ animationDelay: '0.2s' }}>
                Experience premium banking with unmatched security, competitive rates, and personalized service. 
                Join thousands of satisfied customers who trust Heritage Bank.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Button 
                  size="lg" 
                  onClick={onOpenCards}
                  className="bg-heritage-gold text-heritage-blue hover:bg-heritage-gold/90 px-6 lg:px-8 py-3 lg:py-4 font-semibold text-base lg:text-lg banking-button pulse-glow w-full sm:w-auto"
                >
                  Explore Our Cards
                </Button>
                {user ? (
                  <Link to="/dashboard" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-2 border-heritage-gold text-white hover:bg-heritage-gold hover:text-heritage-blue px-6 lg:px-8 py-3 lg:py-4 font-semibold text-base lg:text-lg w-full flex items-center justify-center gap-2"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-2 border-heritage-gold text-white hover:bg-heritage-gold hover:text-heritage-blue px-6 lg:px-8 py-3 lg:py-4 font-semibold text-base lg:text-lg w-full"
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            
            {/* Right Column - Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-heritage-gold/30 hover:bg-white/15 transition-all duration-300">
                <div className="w-12 h-12 bg-heritage-gold/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-heritage-gold" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Secure Banking</h3>
                <p className="text-white/70 text-sm">256-bit encryption and 24/7 fraud monitoring</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-heritage-gold/30 hover:bg-white/15 transition-all duration-300">
                <div className="w-12 h-12 bg-heritage-gold/20 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-heritage-gold" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Premium Cards</h3>
                <p className="text-white/70 text-sm">Exclusive rewards and worldwide acceptance</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-heritage-gold/30 hover:bg-white/15 transition-all duration-300 sm:col-span-2">
                <div className="w-12 h-12 bg-heritage-gold/20 rounded-full flex items-center justify-center mb-4">
                  <Landmark className="w-6 h-6 text-heritage-gold" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Heritage Routing: 021000021</h3>
                <p className="text-white/70 text-sm">Your trusted partner for all banking needs across the USA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
