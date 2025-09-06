import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedHeritageLogoProps {
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'login' | 'transfer' | 'success' | 'loading';
  className?: string;
  onAnimationComplete?: () => void;
}

export const AnimatedHeritageLogo = ({ 
  isActive = false, 
  size = 'md', 
  variant = 'login',
  className,
  onAnimationComplete
}: AnimatedHeritageLogoProps) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isActive) {
      const phases = variant === 'success' ? 4 : 3;
      const interval = setInterval(() => {
        setAnimationPhase(prev => {
          const next = (prev + 1) % phases;
          if (variant === 'success' && next === phases - 1) {
            setShowSuccess(true);
            setTimeout(() => {
              onAnimationComplete?.();
            }, 1000);
          }
          return next;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isActive, variant, onAnimationComplete]);

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
      {/* Outer Shield Frame with Gradient */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-1000",
          isActive && "animate-pulse"
        )}
        style={{
          background: `conic-gradient(from 0deg, 
            hsl(var(--heritage-gold)), 
            hsl(var(--heritage-blue)), 
            hsl(var(--heritage-gold))
          )`,
          padding: '3px',
          animation: isActive ? 'spin 4s linear infinite' : 'none'
        }}
      >
        {/* Inner Shield Background */}
        <div 
          className={cn(
            "w-full h-full rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-500",
            "shadow-2xl border border-heritage-gold/30"
          )}
          style={{
            background: `linear-gradient(135deg, 
              hsl(var(--heritage-blue)), 
              hsl(var(--heritage-blue-dark))
            )`
          }}
        >
          {/* Crown Symbol */}
          <div className={cn(
            "absolute top-3 left-1/2 transform -translate-x-1/2 transition-all duration-500",
            size === 'sm' && "top-2 scale-50",
            size === 'lg' && "top-4 scale-125",
            size === 'xl' && "top-6 scale-150",
            isActive && variant === 'success' && "scale-110 text-heritage-gold"
          )}>
            <svg 
              viewBox="0 0 24 24" 
              className={cn(
                "fill-heritage-gold transition-all duration-500",
                size === 'sm' && "w-3 h-3",
                size === 'md' && "w-4 h-4",
                size === 'lg' && "w-5 h-5",
                size === 'xl' && "w-6 h-6"
              )}
            >
              <path d="M3 8l9-6 9 6-2 8-7-2-7 2z"/>
              <circle cx="12" cy="12" r="1"/>
            </svg>
          </div>

          {/* Heritage Text with HIH */}
          <div className="text-center">
            {/* HIH Letters */}
            <div className={cn(
              "font-bold text-heritage-gold mb-1 transition-all duration-500 tracking-wider",
              size === 'sm' && "text-xs",
              size === 'md' && "text-sm", 
              size === 'lg' && "text-lg",
              size === 'xl' && "text-2xl",
              isActive && "animate-pulse"
            )}
            style={{
              fontFamily: 'serif',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              transform: isActive ? `scale(${1 + animationPhase * 0.05})` : 'none'
            }}>
              HIH
            </div>
            
            {/* Heritage Text */}
            <div className={cn(
              "font-bold text-heritage-gold transition-all duration-500",
              size === 'sm' && "text-xs leading-tight",
              size === 'md' && "text-sm leading-tight", 
              size === 'lg' && "text-base leading-tight",
              size === 'xl' && "text-xl leading-tight",
              isActive && variant === 'success' && "text-success scale-105"
            )}
            style={{
              fontFamily: 'serif',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              transform: isActive ? `rotateY(${animationPhase * 10}deg)` : 'none'
            }}>
              HERITAGE
            </div>
            
            {/* Bank Text */}
            <div className={cn(
              "font-semibold text-heritage-gold/90 transition-all duration-500",
              size === 'sm' && "text-xs",
              size === 'md' && "text-sm", 
              size === 'lg' && "text-base",
              size === 'xl' && "text-lg"
            )}
            style={{
              fontFamily: 'serif',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}>
              BANK
            </div>
          </div>

          {/* Success Checkmark Overlay */}
          {variant === 'success' && showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 text-success animate-scale-in bg-background/90 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            </div>
          )}

          {/* Pulsing Background Effect */}
          <div className={cn(
            "absolute inset-0 rounded-full opacity-20 transition-all duration-500",
            isActive && "animate-pulse",
            variant === 'login' && "bg-heritage-blue",
            variant === 'transfer' && "bg-heritage-gold", 
            variant === 'success' && "bg-success",
            variant === 'loading' && "bg-heritage-gold"
          )} />

          {/* Particle Effects */}
          {variant === 'transfer' && isActive && (
            <>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute w-1 h-1 bg-heritage-gold rounded-full",
                    animationPhase >= 2 && "animate-ping"
                  )}
                  style={{
                    top: `${20 + (i % 4) * 15}%`,
                    left: `${15 + (i % 2) * 70}%`,
                    animationDelay: `${i * 0.1}s`,
                    animation: animationPhase >= 2 ? `particle-float 1.5s ease-in-out infinite ${i * 0.1}s` : 'none'
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Status Text */}
      {size !== 'sm' && (
        <div className={cn(
          "absolute -bottom-8 left-1/2 transform -translate-x-1/2",
          "text-xs font-medium text-muted-foreground whitespace-nowrap",
          isActive && "animate-fade-in"
        )}>
          {variant === 'login' && 'Authenticating...'}
          {variant === 'transfer' && 'Processing Transfer...'}
          {variant === 'success' && 'Success!'}
          {variant === 'loading' && 'Loading...'}
        </div>
      )}
    </div>
  );
};