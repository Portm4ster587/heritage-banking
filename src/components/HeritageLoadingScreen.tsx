import { AnimatedHeritageLogo } from './AnimatedHeritageLogo';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface HeritageLoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export const HeritageLoadingScreen = ({ 
  message = 'Loading...', 
  fullScreen = true 
}: HeritageLoadingScreenProps) => {
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
        {/* Logo with enhanced animation */}
        <div className="relative">
          <AnimatedHeritageLogo size="xl" isActive={true} variant="loading" />
          
          {/* Spinning loader ring around logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-56 h-56 text-heritage-gold/30 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <p className="text-heritage-gold text-xl font-semibold animate-pulse tracking-wide">{message}</p>
          
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
