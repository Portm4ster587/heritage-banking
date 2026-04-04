import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Globe, ShieldCheck, Landmark, ArrowUpRight, Lock } from 'lucide-react';

interface WireTransferProgressProps {
  isVisible: boolean;
  onComplete: () => void;
  transferType?: 'domestic' | 'international';
}

export const WireTransferProgress = ({ isVisible, onComplete, transferType = 'domestic' }: WireTransferProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(0);

  const steps = transferType === 'international' ? [
    'Encrypting wire details',
    'Validating SWIFT routing',
    'Contacting correspondent bank',
    'Compliance verification',
    'Processing international wire',
    'Confirming with recipient bank'
  ] : [
    'Encrypting wire details',
    'Validating routing number',
    'Contacting Federal Reserve',
    'Compliance verification',
    'Processing domestic wire',
    'Confirming with recipient bank'
  ];

  const stepIcons = [Lock, ShieldCheck, Landmark, ShieldCheck, ArrowUpRight, CheckCircle];

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setCurrentStep(0);
      setPulsePhase(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return 100;
        }
        const newProgress = prev + 1.2;
        setCurrentStep(Math.min(Math.floor(newProgress / 17), steps.length - 1));
        return newProgress;
      });
    }, 90);

    const pulseInterval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 360);
    }, 50);

    return () => {
      clearInterval(interval);
      clearInterval(pulseInterval);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const StepIcon = stepIcons[currentStep];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0a1628] via-[#1a2d4a] to-[#0d1b2a] z-50 flex items-center justify-center p-4">
      {/* Animated network lines background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-heritage-gold/30 to-transparent"
            style={{
              top: `${15 + i * 15}%`,
              left: '-10%',
              right: '-10%',
              transform: `rotate(${-5 + i * 2}deg)`,
              animation: `pulse ${2 + i * 0.3}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
        <div
          className="absolute w-80 h-80 rounded-full blur-3xl"
          style={{
            background: transferType === 'international'
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%)',
            top: '10%',
            right: '10%',
            animation: 'pulse 3s ease-in-out infinite'
          }}
        />
      </div>

      <Card className="w-full max-w-md animate-scale-in bg-white/95 backdrop-blur-sm shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-heritage-gold to-blue-600" />

        <CardContent className="p-8 text-center space-y-6">
          {/* Globe/Bank Icon Animation */}
          <div className="relative w-32 h-32 mx-auto">
            {/* Rotating outer ring */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 128" style={{ animation: 'spin 6s linear infinite' }}>
              <circle cx="64" cy="64" r="58" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="8 4" opacity="0.3" />
            </svg>
            {/* Counter-rotating inner ring */}
            <svg className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)]" viewBox="0 0 128 128" style={{ animation: 'spin 4s linear infinite reverse' }}>
              <circle cx="64" cy="64" r="54" fill="none" stroke="hsl(var(--heritage-gold))" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.5" />
            </svg>

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#0d1b2a] flex items-center justify-center shadow-lg">
                {transferType === 'international' ? (
                  <Globe className="w-10 h-10 text-heritage-gold" style={{ filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))' }} />
                ) : (
                  <Landmark className="w-10 h-10 text-heritage-gold" style={{ filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))' }} />
                )}
              </div>
            </div>

            {/* Orbiting dots */}
            {[...Array(4)].map((_, i) => {
              const angle = (pulsePhase + i * 90) * (Math.PI / 180);
              return (
                <div
                  key={i}
                  className="absolute w-2.5 h-2.5 rounded-full bg-blue-400"
                  style={{
                    top: `${50 + Math.sin(angle) * 42}%`,
                    left: `${50 + Math.cos(angle) * 42}%`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 8px rgba(96, 165, 250, 0.8)',
                    opacity: 0.8
                  }}
                />
              );
            })}
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#1e3a5f]">
              {transferType === 'international' ? 'International Wire Transfer' : 'Domestic Wire Transfer'}
            </h3>
            <p className="text-sm text-muted-foreground">Secure Bank-to-Bank Transfer</p>

            {/* Progress ring */}
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
                <circle
                  cx="50" cy="50" r="40"
                  stroke="url(#wireGrad)"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={251.33}
                  strokeDashoffset={251.33 - (progress / 100) * 251.33}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                <defs>
                  <linearGradient id="wireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#d4af37" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-[#1e3a5f]">{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Current step with icon */}
            <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg">
              <StepIcon className="w-4 h-4 text-blue-600 animate-pulse" />
              <p className="text-sm font-medium text-[#1e3a5f]">{steps[currentStep]}</p>
            </div>

            {/* Step dots */}
            <div className="flex justify-center gap-1.5">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= currentStep ? 'bg-blue-500' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            {progress === 100 && (
              <div className="flex items-center justify-center gap-2 text-green-600 animate-fade-in pt-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Wire Transfer Submitted!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
