import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { HeritageSVGLogoTransparent } from "../HeritageSVGLogoTransparent";
import { Shield, CreditCard, Landmark, ArrowRight, Globe, TrendingUp } from "lucide-react";
import heritageBuildingHero from "@/assets/heritage-building-hero.png";

interface HeroSectionProps {
  user: any;
  onOpenCards: () => void;
  onOpenApplication: () => void;
}

export const HeroSection = ({ user, onOpenCards, onOpenApplication }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden">
      <div className="min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] relative animate-fade-in flex items-center py-6 sm:py-8 lg:py-12">
        {/* Static Heritage Bank Building Background - clear, not covered */}
        <img
          src={heritageBuildingHero}
          alt="Heritage Bank Headquarters"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        
        {/* Light overlay - keeps image visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-heritage-blue/75 via-heritage-blue/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-heritage-blue-dark/40 via-transparent to-transparent"></div>
        
        {/* Gold accent lines */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-heritage-gold/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-heritage-gold/40 to-transparent"></div>
        
        <div className="relative container mx-auto px-4 sm:px-6">
          {/* Top Header with SVG Logo */}
          <div className="flex items-center space-x-3 sm:space-x-4 mb-6 lg:mb-8 animate-slide-up">
            <HeritageSVGLogoTransparent size="lg" className="w-14 h-14 sm:w-18 sm:h-18 lg:w-22 lg:h-22 drop-shadow-[0_0_25px_rgba(212,175,55,0.9)]" />
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold animate-fade-in text-heritage-gold tracking-[0.15em] drop-shadow-lg">
                HERITAGE
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-heritage-gold/90 tracking-[0.3em] font-light drop-shadow-md">BANK</p>
            </div>
          </div>

          <div className="max-w-xl space-y-4 lg:space-y-6 animate-slide-up">
            <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold leading-tight text-white drop-shadow-lg">
              Banking Excellence <br className="hidden sm:block" />
              <span className="text-heritage-gold">Since 1892</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed drop-shadow-md">
              Where tradition meets innovation. Premium banking with 
              unmatched security, competitive rates, and personalized service.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap gap-2 text-xs text-heritage-gold font-medium">
              <span className="flex items-center gap-1.5 bg-heritage-blue/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-heritage-gold/30">
                <Shield className="w-3.5 h-3.5" /> FDIC Insured
              </span>
              <span className="flex items-center gap-1.5 bg-heritage-blue/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-heritage-gold/30">
                <Globe className="w-3.5 h-3.5" /> Nationwide
              </span>
              <span className="flex items-center gap-1.5 bg-heritage-blue/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-heritage-gold/30">
                <TrendingUp className="w-3.5 h-3.5" /> A+ Rated
              </span>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg" 
                onClick={onOpenCards}
                className="bg-heritage-gold text-heritage-blue hover:bg-heritage-gold/90 px-6 lg:px-8 py-3 font-semibold text-base banking-button pulse-glow w-full sm:w-auto shadow-lg shadow-heritage-gold/30"
              >
                Explore Our Cards
              </Button>
              {user ? (
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-heritage-gold text-white hover:bg-heritage-gold hover:text-heritage-blue px-6 lg:px-8 py-3 font-semibold text-base w-full flex items-center justify-center gap-2 backdrop-blur-sm"
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
                    className="border-2 border-heritage-gold text-white hover:bg-heritage-gold hover:text-heritage-blue px-6 lg:px-8 py-3 font-semibold text-base w-full backdrop-blur-sm"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
