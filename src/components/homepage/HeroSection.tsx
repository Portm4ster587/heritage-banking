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
      <div className="min-h-[650px] lg:min-h-[750px] relative animate-fade-in flex items-center py-8 lg:py-12">
        {/* Static Heritage Bank Building Background - NO sliding */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heritageBuildingHero})` }}
        />
        
        {/* Premium overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-heritage-blue/95 via-heritage-blue/80 to-heritage-blue-dark/85"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-heritage-blue-dark/50 via-transparent to-heritage-blue/20"></div>
        
        {/* Gold accent lines */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-heritage-gold/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-heritage-gold/40 to-transparent"></div>

        {/* Floating gold orbs */}
        <div className="absolute top-16 right-16 w-40 h-40 bg-heritage-gold/10 rounded-full blur-2xl animate-float hidden lg:block"></div>
        <div className="absolute bottom-24 left-24 w-28 h-28 bg-heritage-gold/8 rounded-full blur-xl animate-float hidden sm:block" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="relative container mx-auto px-4 sm:px-6">
          {/* Top Header with SVG Logo */}
          <div className="flex items-center space-x-3 sm:space-x-4 mb-8 lg:mb-10 animate-slide-up">
            <HeritageSVGLogoTransparent size="lg" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 drop-shadow-[0_0_25px_rgba(212,175,55,0.9)]" />
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold animate-fade-in text-heritage-gold tracking-[0.15em]">
                HERITAGE
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-heritage-gold/80 tracking-[0.3em] font-light">BANK</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Column */}
            <div className="text-white space-y-5 lg:space-y-7 animate-slide-up">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight">
                Banking Excellence <br className="hidden sm:block" />
                <span className="text-heritage-gold">Since 1892</span>
              </h2>
              <p className="text-base lg:text-lg text-white/85 leading-relaxed max-w-xl" style={{ animationDelay: '0.2s' }}>
                Where tradition meets innovation. Experience premium banking with 
                unmatched security, competitive rates, and personalized service trusted 
                by over 100,000 clients nationwide.
              </p>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap gap-3 text-xs text-heritage-gold/90 font-medium" style={{ animationDelay: '0.3s' }}>
                <span className="flex items-center gap-1.5 bg-heritage-gold/10 px-3 py-1.5 rounded-full border border-heritage-gold/20">
                  <Shield className="w-3.5 h-3.5" /> FDIC Insured
                </span>
                <span className="flex items-center gap-1.5 bg-heritage-gold/10 px-3 py-1.5 rounded-full border border-heritage-gold/20">
                  <Globe className="w-3.5 h-3.5" /> Nationwide
                </span>
                <span className="flex items-center gap-1.5 bg-heritage-gold/10 px-3 py-1.5 rounded-full border border-heritage-gold/20">
                  <TrendingUp className="w-3.5 h-3.5" /> A+ Rated
                </span>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4" style={{ animationDelay: '0.4s' }}>
                <Button 
                  size="lg" 
                  onClick={onOpenCards}
                  className="bg-heritage-gold text-heritage-blue hover:bg-heritage-gold/90 px-6 lg:px-8 py-3 lg:py-4 font-semibold text-base lg:text-lg banking-button pulse-glow w-full sm:w-auto shadow-lg shadow-heritage-gold/20"
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
              <div className="bg-white/8 backdrop-blur-md rounded-xl p-6 border border-heritage-gold/20 hover:bg-white/12 hover:border-heritage-gold/40 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-heritage-gold/30 to-heritage-gold/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-heritage-gold" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Secure Banking</h3>
                <p className="text-white/60 text-sm">256-bit encryption and 24/7 fraud monitoring</p>
              </div>
              
              <div className="bg-white/8 backdrop-blur-md rounded-xl p-6 border border-heritage-gold/20 hover:bg-white/12 hover:border-heritage-gold/40 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-heritage-gold/30 to-heritage-gold/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6 text-heritage-gold" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Premium Cards</h3>
                <p className="text-white/60 text-sm">Exclusive rewards and worldwide acceptance</p>
              </div>
              
              <div className="bg-white/8 backdrop-blur-md rounded-xl p-6 border border-heritage-gold/20 hover:bg-white/12 hover:border-heritage-gold/40 transition-all duration-300 sm:col-span-2 group">
                <div className="w-12 h-12 bg-gradient-to-br from-heritage-gold/30 to-heritage-gold/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Landmark className="w-6 h-6 text-heritage-gold" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Heritage Routing: 021000021</h3>
                <p className="text-white/60 text-sm">Your trusted partner for all banking needs across the USA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
