import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { HeritageSVGLogo } from "../HeritageSVGLogo";
import { AccountSummaryWidget } from "./AccountSummaryWidget";
import { CryptoPortfolioWidget } from "./CryptoPortfolioWidget";
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
      <div className="min-h-[700px] relative animate-fade-in flex items-center py-12">
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
        <div className="absolute top-10 right-10 w-32 h-32 bg-heritage-gold/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-heritage-gold/10 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-heritage-gold/15 rounded-full blur-md animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative container mx-auto px-6">
          {/* Top Header with SVG Logo */}
          <div className="flex items-center space-x-4 mb-8 animate-slide-up">
            <HeritageSVGLogo size="xl" className="animate-pulse" />
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold animate-fade-in text-heritage-gold tracking-wider">
                HERITAGE
              </h1>
              <p className="text-xl lg:text-2xl text-heritage-gold/90 tracking-widest">BANK</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column - Welcome Text */}
            <div className="text-white space-y-6 animate-slide-up">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 animate-fade-in">
                Banking Excellence Since 1892
              </h2>
              <p className="text-lg mb-8 text-white/90 animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s' }}>
                Experience premium banking with unmatched security, competitive rates, and personalized service. 
                Join thousands of satisfied customers who trust Heritage Bank.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Button 
                  size="lg" 
                  onClick={onOpenCards}
                  className="bg-heritage-gold text-heritage-blue hover:bg-heritage-gold/90 px-8 py-4 font-semibold text-lg banking-button pulse-glow"
                >
                  Explore Our Cards
                </Button>
                {user ? (
                  <Link to="/dashboard">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-2 border-heritage-gold text-white hover:bg-heritage-gold hover:text-heritage-blue px-8 py-4 font-semibold text-lg"
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={onOpenApplication}
                    className="border-2 border-heritage-gold text-white hover:bg-heritage-gold hover:text-heritage-blue px-8 py-4 font-semibold text-lg"
                  >
                    Open Account
                  </Button>
                )}
              </div>
            </div>
            
            {/* Center Column - Account Summary Widget */}
            <div className="hidden lg:block animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <AccountSummaryWidget />
            </div>

            {/* Right Column - Crypto Portfolio Widget */}
            <div className="hidden lg:block animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <CryptoPortfolioWidget />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
