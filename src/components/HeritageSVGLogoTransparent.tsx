import { cn } from "@/lib/utils";

interface HeritageSVGLogoTransparentProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

export const HeritageSVGLogoTransparent = ({ 
  className, 
  size = "md",
  animated = false 
}: HeritageSVGLogoTransparentProps) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32"
  };

  return (
    <svg
      viewBox="0 0 120 120"
      className={cn(
        sizeClasses[size], 
        "drop-shadow-lg",
        animated && "animate-pulse",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Transparent background - no fill on outer elements */}
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(43, 74%, 55%)" />
          <stop offset="50%" stopColor="hsl(43, 74%, 49%)" />
          <stop offset="100%" stopColor="hsl(43, 74%, 40%)" />
        </linearGradient>
        <linearGradient id="goldGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(43, 74%, 45%)" />
          <stop offset="100%" stopColor="hsl(43, 74%, 35%)" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Outer circle - transparent with gold border */}
      <circle
        cx="60"
        cy="60"
        r="56"
        fill="transparent"
        stroke="url(#goldGradient)"
        strokeWidth="3"
        filter="url(#glow)"
      />
      
      {/* Inner decorative circle */}
      <circle
        cx="60"
        cy="60"
        r="48"
        fill="transparent"
        stroke="url(#goldGradient)"
        strokeWidth="1.5"
        strokeDasharray="4 2"
      />

      {/* Heritage H letter with gradient */}
      <g fill="url(#goldGradient)" filter="url(#glow)">
        {/* Left vertical bar */}
        <rect x="32" y="30" width="8" height="60" rx="2" />
        {/* Right vertical bar */}
        <rect x="80" y="30" width="8" height="60" rx="2" />
        {/* Horizontal connector */}
        <rect x="32" y="55" width="56" height="8" rx="2" />
      </g>

      {/* Decorative wings/feathers */}
      <g stroke="url(#goldGradient)" fill="none" strokeWidth="1.5" strokeLinecap="round">
        {/* Left wing */}
        <path d="M20 60 Q25 45 32 40" />
        <path d="M22 65 Q27 52 32 48" />
        <path d="M24 70 Q29 60 32 56" />
        
        {/* Right wing */}
        <path d="M100 60 Q95 45 88 40" />
        <path d="M98 65 Q93 52 88 48" />
        <path d="M96 70 Q91 60 88 56" />
      </g>

      {/* Top crown/star element */}
      <g fill="url(#goldGradient)">
        <polygon points="60,15 63,22 60,20 57,22" />
        <circle cx="60" cy="24" r="2" />
      </g>

      {/* Bottom decorative element */}
      <g fill="url(#goldGradient)">
        <polygon points="60,105 55,98 60,100 65,98" />
      </g>

      {/* Corner accents */}
      <g stroke="url(#goldGradient)" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M25 25 L25 35 M25 25 L35 25" />
        <path d="M95 25 L95 35 M95 25 L85 25" />
        <path d="M25 95 L25 85 M25 95 L35 95" />
        <path d="M95 95 L95 85 M95 95 L85 95" />
      </g>

      {/* Small decorative dots */}
      <g fill="url(#goldGradient)">
        <circle cx="28" cy="28" r="1.5" />
        <circle cx="92" cy="28" r="1.5" />
        <circle cx="28" cy="92" r="1.5" />
        <circle cx="92" cy="92" r="1.5" />
      </g>
    </svg>
  );
};
