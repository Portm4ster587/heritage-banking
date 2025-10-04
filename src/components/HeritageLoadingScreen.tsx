import { AnimatedHeritageLogo } from './AnimatedHeritageLogo';
import { cn } from '@/lib/utils';

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
        "flex flex-col items-center justify-center bg-gradient-to-br from-heritage-blue via-heritage-blue-dark to-heritage-blue",
        fullScreen && "min-h-screen",
        !fullScreen && "min-h-[400px]"
      )}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-heritage-gold/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-heritage-gold/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10 space-y-6 animate-fade-in">
        <AnimatedHeritageLogo size="xl" isActive={true} variant="loading" />
        <div className="text-center space-y-2">
          <p className="text-heritage-gold text-lg font-medium animate-pulse">{message}</p>
          <div className="flex space-x-2 justify-center">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-heritage-gold rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
