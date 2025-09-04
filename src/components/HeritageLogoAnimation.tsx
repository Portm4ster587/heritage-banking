import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HeritageLogoAnimationProps {
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'login' | 'transfer' | 'success';
  className?: string;
}

export const HeritageLogoAnimation = ({ 
  isActive = false, 
  size = 'md', 
  variant = 'login',
  className 
}: HeritageLogoAnimationProps) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (isActive) {
      const phases = variant === 'transfer' ? 4 : 3;
      const interval = setInterval(() => {
        setAnimationPhase(prev => (prev + 1) % phases);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isActive, variant]);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  const logoSize = sizeClasses[size];

  return (
    <div className={cn(
      "relative flex items-center justify-center",
      logoSize,
      className
    )}>
      {/* Outer Rotating Ring */}
      <div className={cn(
        "absolute inset-0 rounded-full border-4 border-transparent",
        "bg-gradient-to-r from-primary via-accent to-secondary bg-clip-border",
        isActive && "animate-spin",
        variant === 'transfer' && animationPhase >= 1 && "animate-pulse"
      )} 
      style={{ 
        animation: isActive ? `spin 3s linear infinite, pulse-ring 2s ease-in-out infinite` : 'none',
        background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--secondary)), hsl(var(--primary)))',
        padding: '2px'
      }}>
        {/* Inner Logo Container */}
        <div className={cn(
          "w-full h-full rounded-full bg-background flex items-center justify-center",
          "shadow-inner relative overflow-hidden"
        )}>
          
          {/* Heritage "H" Letter */}
          <div className={cn(
            "relative font-bold text-primary transition-all duration-500",
            size === 'sm' && "text-lg",
            size === 'md' && "text-2xl", 
            size === 'lg' && "text-4xl",
            size === 'xl' && "text-6xl",
            isActive && variant === 'success' && "text-success scale-110",
            isActive && variant === 'transfer' && animationPhase >= 2 && "scale-125 text-accent"
          )}
          style={{
            fontFamily: 'serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transform: isActive ? `rotateY(${animationPhase * 90}deg) scale(${1 + animationPhase * 0.1})` : 'none',
            transformStyle: 'preserve-3d'
          }}>
            H
          </div>

          {/* Particle Effects for Transfer Animation */}
          {variant === 'transfer' && isActive && (
            <>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute w-1 h-1 bg-accent rounded-full",
                    animationPhase >= 3 && "animate-ping"
                  )}
                  style={{
                    top: `${20 + i * 10}%`,
                    left: `${15 + (i % 2) * 70}%`,
                    animationDelay: `${i * 0.1}s`,
                    animation: animationPhase >= 3 ? `particle-float 1.5s ease-in-out infinite ${i * 0.1}s` : 'none'
                  }}
                />
              ))}
            </>
          )}

          {/* Success Checkmark Overlay */}
          {variant === 'success' && animationPhase >= 2 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 text-success animate-scale-in">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            </div>
          )}

          {/* Pulsing Background Effect */}
          <div className={cn(
            "absolute inset-0 rounded-full opacity-20",
            isActive && "animate-pulse",
            variant === 'login' && "bg-primary",
            variant === 'transfer' && "bg-accent", 
            variant === 'success' && "bg-success"
          )} />
        </div>
      </div>

      {/* Text Label */}
      {size !== 'sm' && (
        <div className={cn(
          "absolute -bottom-8 left-1/2 transform -translate-x-1/2",
          "text-xs font-medium text-muted-foreground whitespace-nowrap",
          isActive && "animate-fade-in"
        )}>
          {variant === 'login' && 'Authenticating...'}
          {variant === 'transfer' && 'Processing Transfer...'}
          {variant === 'success' && 'Success!'}
        </div>
      )}

    </div>
  );
};