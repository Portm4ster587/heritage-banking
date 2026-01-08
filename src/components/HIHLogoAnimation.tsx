import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HIHLogoAnimationProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onComplete?: () => void;
  duration?: number;
}

export const HIHLogoAnimation = ({ 
  size = 'lg',
  className,
  onComplete,
  duration = 3000
}: HIHLogoAnimationProps) => {
  const [phase, setPhase] = useState(0);
  const [showText, setShowText] = useState<'H' | 'I' | 'H2'>('H');

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhase(prev => {
        if (prev >= 5) {
          clearInterval(phaseInterval);
          onComplete?.();
          return prev;
        }
        return prev + 1;
      });
    }, duration / 6);

    const textInterval = setInterval(() => {
      setShowText(prev => {
        if (prev === 'H') return 'I';
        if (prev === 'I') return 'H2';
        return 'H';
      });
    }, 600);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(textInterval);
    };
  }, [duration, onComplete]);

  const sizeClasses = {
    sm: { container: 'w-20 h-20', text: 'text-3xl', subtext: 'text-[8px]' },
    md: { container: 'w-32 h-32', text: 'text-5xl', subtext: 'text-xs' },
    lg: { container: 'w-48 h-48', text: 'text-7xl', subtext: 'text-sm' },
    xl: { container: 'w-64 h-64', text: 'text-8xl', subtext: 'text-base' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn(
      "relative flex flex-col items-center justify-center",
      currentSize.container,
      className
    )}>
      {/* Outer rotating ring */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, hsl(var(--heritage-gold)), hsl(var(--heritage-blue)), hsl(var(--heritage-gold)), hsl(var(--heritage-blue)), hsl(var(--heritage-gold)))',
          animation: 'spin 2s linear infinite',
          padding: '3px'
        }}
      >
        <div className="w-full h-full rounded-full bg-heritage-blue" />
      </div>

      {/* Inner glow effect */}
      <div 
        className="absolute inset-2 rounded-full animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%)',
          filter: 'blur(8px)'
        }}
      />

      {/* Main logo container */}
      <div className={cn(
        "absolute inset-3 rounded-full bg-gradient-to-br from-heritage-blue via-heritage-blue-dark to-heritage-blue",
        "flex items-center justify-center shadow-2xl overflow-hidden border-2 border-heritage-gold/30"
      )}>
        {/* Animated letter */}
        <div className="relative">
          <span 
            className={cn(
              "font-serif font-bold transition-all duration-300",
              currentSize.text,
              showText === 'I' ? 'text-heritage-gold' : 'text-heritage-gold'
            )}
            style={{
              textShadow: '0 0 30px rgba(212, 175, 55, 0.8), 0 0 60px rgba(212, 175, 55, 0.4)',
              transform: `scale(${1 + (phase * 0.02)}) rotateY(${phase * 15}deg)`,
              fontFamily: 'Times New Roman, serif'
            }}
          >
            {showText === 'H' && 'H'}
            {showText === 'I' && 'I'}
            {showText === 'H2' && 'H'}
          </span>
        </div>

        {/* Particle effects */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-heritage-gold rounded-full"
            style={{
              top: `${20 + Math.sin(i * 0.8) * 30}%`,
              left: `${50 + Math.cos(i * 0.8) * 35}%`,
              animation: `pulse-glow ${1 + i * 0.1}s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
              opacity: 0.7
            }}
          />
        ))}
      </div>

      {/* Bank name below */}
      <div 
        className={cn(
          "absolute -bottom-8 text-center",
          currentSize.subtext
        )}
        style={{
          opacity: phase > 1 ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }}
      >
        <p className="font-bold text-heritage-gold tracking-widest">HERITAGE</p>
        <p className="text-heritage-gold/70 tracking-[0.3em] text-[0.7em]">INVESTMENTS</p>
      </div>
    </div>
  );
};
