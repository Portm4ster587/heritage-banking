import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { AnimatedHeritageLogo } from "../AnimatedHeritageLogo";
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
      <div className="min-h-[600px] relative animate-fade-in flex items-center">
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
        
        <div className="relative container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6 animate-slide-up">
            <div className="flex items-center space-x-4 mb-6">
              <AnimatedHeritageLogo size="lg" isActive={true} variant="loading" />
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold animate-fade-in text-heritage-gold">
                  HERITAGE
                </h1>
                <p className="text-xl lg:text-2xl text-heritage-gold/90">BANK</p>
              </div>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 animate-fade-in">
              Banking Excellence Since 1892
            </h2>
            <p className="text-xl mb-8 text-white/90 animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s' }}>
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
          
          <div className="hidden lg:block relative animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="bg-heritage-blue backdrop-blur-md rounded-2xl p-8 border border-heritage-gold/20 shadow-2xl hover-scale">
              <h3 className="text-2xl font-bold text-heritage-gold mb-4">Why Choose Heritage Bank?</h3>
              <ul className="space-y-4 text-white">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-heritage-gold rounded-full mt-2"></div>
                  <span className="flex-1 text-white">FDIC Insured up to $250,000 per depositor</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-heritage-gold rounded-full mt-2"></div>
                  <span className="flex-1 text-white">No monthly fees on eligible accounts</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-heritage-gold rounded-full mt-2"></div>
                  <span className="flex-1 text-white">Competitive interest rates on savings</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-heritage-gold rounded-full mt-2"></div>
                  <span className="flex-1 text-white">Award-winning mobile banking app</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-heritage-gold rounded-full mt-2"></div>
                  <span className="flex-1 text-white">Free ATM access at 55,000+ locations nationwide</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
