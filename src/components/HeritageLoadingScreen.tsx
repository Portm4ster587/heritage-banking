import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import heritageLogoImage1 from '@/assets/heritage-logo-1.png';
import heritageLogoImage2 from '@/assets/heritage-logo-2.png';

interface HeritageLoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export const HeritageLoadingScreen = ({ 
  message = 'Loading...', 
  fullScreen = true 
}: HeritageLoadingScreenProps) => {
  const [currentLogo, setCurrentLogo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogo(prev => prev === 0 ? 1 : 0);
    }, 1000); // Switch every 1 second

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center bg-gradient-to-br from-heritage-blue via-heritage-blue-dark to-heritage-blue relative overflow-hidden",
        fullScreen && "min-h-screen",
        !fullScreen && "min-h-[400px]"
      )}
    >
      {/* Enhanced animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-heritage-gold/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-heritage-gold/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-heritage-gold/5 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-heritage-blue-dark/20 to-transparent animate-pulse"></div>
      </div>
      
      <div className="relative z-10 space-y-8 animate-fade-in px-4">
        {/* Alternating Logo Animation */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <img 
            src={currentLogo === 0 ? heritageLogoImage1 : heritageLogoImage2}
            alt="Heritage Bank Logo" 
            className="w-full h-full object-contain transition-all duration-300 animate-pulse p-2"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.9)) brightness(1.3)',
            }}
          />
        </div>
        
        <div className="text-center space-y-4">
          {/* Enhanced loading dots */}
          <div className="flex space-x-2 justify-center">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-heritage-gold rounded-full animate-bounce shadow-lg shadow-heritage-gold/50"
                style={{ 
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
          
          {/* Progress bar */}
          <div className="w-64 h-1 bg-heritage-blue-dark/50 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-heritage-gold to-heritage-gold/50 rounded-full animate-pulse" 
                 style={{ 
                   width: '60%',
                   animation: 'slide-progress 2s ease-in-out infinite'
                 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
