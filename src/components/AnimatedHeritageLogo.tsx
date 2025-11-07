import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import heritageLogoImage from '@/assets/heritage-logo.png';

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
      {/* Pulsing Glow Effect */}
      <div 
        className={cn(
          "absolute inset-0 transition-all duration-1000",
          isActive && "animate-pulse"
        )}
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%)',
          filter: 'blur(10px)',
        }}
      />
      
      {/* Heritage Logo Image with Pulse Animation */}
      <img 
        src={heritageLogoImage} 
        alt="Heritage Bank Logo" 
        className={cn(
          "relative w-full h-full object-contain transition-all duration-500 p-2",
          isActive && "animate-pulse"
        )}
        style={{
          filter: isActive 
            ? 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.9)) brightness(1.3)' 
            : 'drop-shadow(0 4px 12px rgba(212, 175, 55, 0.6))',
          transform: isActive ? 'scale(1.05)' : 'scale(1)',
        }}
      />

      {/* Success Checkmark Overlay */}
      {variant === 'success' && showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-8 h-8 text-success animate-scale-in bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};