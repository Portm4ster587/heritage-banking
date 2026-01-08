import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { HIHLogoAnimation } from './HIHLogoAnimation';

interface LoginSuccessAnimationProps {
  onComplete?: () => void;
  userName?: string;
}

export const LoginSuccessAnimation = ({ 
  onComplete,
  userName = 'User'
}: LoginSuccessAnimationProps) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Animation phases over 3 seconds
    const timer1 = setTimeout(() => setPhase(1), 500);
    const timer2 = setTimeout(() => setPhase(2), 1500);
    const timer3 = setTimeout(() => setPhase(3), 2500);
    const timer4 = setTimeout(() => {
      onComplete?.();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-heritage-blue via-heritage-blue-dark to-heritage-blue">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.3) 0%, transparent 50%), 
                           radial-gradient(circle at 80% 50%, rgba(212, 175, 55, 0.2) 0%, transparent 50%)`
        }}
      />

      <div className="relative flex flex-col items-center justify-center">
        {/* HIH Logo Animation - Centered */}
        <div className={cn(
          "transition-all duration-700 ease-out",
          phase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-75"
        )}>
          <HIHLogoAnimation 
            size="lg" 
            duration={2500}
          />
        </div>

        {/* Welcome text */}
        <div className={cn(
          "mt-16 text-center transition-all duration-500",
          phase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <h2 className="text-2xl font-light text-heritage-gold mb-2">
            Welcome Back
          </h2>
          <p className="text-heritage-gold/80 font-semibold text-lg">
            {userName}
          </p>
        </div>

        {/* Loading bar */}
        <div className={cn(
          "mt-8 w-64 h-1 bg-heritage-gold/20 rounded-full overflow-hidden transition-opacity duration-300",
          phase >= 1 ? "opacity-100" : "opacity-0"
        )}>
          <div 
            className="h-full bg-gradient-to-r from-heritage-gold via-heritage-gold-light to-heritage-gold rounded-full"
            style={{
              width: `${Math.min(phase * 35, 100)}%`,
              transition: 'width 0.8s ease-out'
            }}
          />
        </div>

        {/* Status text */}
        <p className={cn(
          "mt-4 text-sm text-heritage-gold/60 transition-all duration-300",
          phase >= 1 ? "opacity-100" : "opacity-0"
        )}>
          {phase < 2 ? 'Authenticating...' : phase < 3 ? 'Loading your accounts...' : 'Welcome to Heritage'}
        </p>
      </div>
    </div>
  );
};
