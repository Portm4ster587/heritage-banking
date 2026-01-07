import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { HeritageSVGLogoTransparent } from './HeritageSVGLogoTransparent';

interface HeritageLoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export const HeritageLoadingScreen = ({ 
  message = 'Loading...', 
  fullScreen = true 
}: HeritageLoadingScreenProps) => {
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 4);
    }, 750); // 3 second total animation (4 phases x 750ms)

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center bg-gradient-to-br from-heritage-blue via-heritage-blue-dark to-heritage-blue relative overflow-hidden",
        fullScreen && "min-h-screen w-full",
        !fullScreen && "min-h-[400px] w-full"
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
      
      <div className="relative z-10 w-full max-w-md mx-auto px-4 flex flex-col items-center justify-center">
        {/* SVG Logo Animation - Centered */}
        <div className="relative w-48 h-48 flex items-center justify-center mx-auto mb-8">
          <div 
            className={cn(
              "absolute inset-0 rounded-full transition-all duration-500",
              pulsePhase % 2 === 0 ? "scale-110 opacity-30" : "scale-100 opacity-50"
            )}
            style={{
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)',
            }}
          />
          <HeritageSVGLogoTransparent 
            size="xl"
            animated={true}
            className={cn(
              "w-40 h-40 transition-all duration-500",
              pulsePhase % 2 === 0 ? "drop-shadow-[0_0_30px_rgba(212,175,55,1)]" : "drop-shadow-[0_0_20px_rgba(212,175,55,0.8)]"
            )}
          />
        </div>
        
        <div className="text-center space-y-4 w-full">
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
          
          {/* Progress bar - 3 second animation */}
          <div className="w-64 h-1 bg-heritage-blue-dark/50 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-heritage-gold to-heritage-gold/50 rounded-full" 
                 style={{ 
                   width: '100%',
                   animation: 'slide-progress 3s ease-in-out infinite'
                 }}
            />
          </div>
          
          {/* Loading message */}
          <p className="text-heritage-gold/80 text-sm font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};
