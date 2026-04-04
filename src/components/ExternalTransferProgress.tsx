import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Building2, ArrowLeftRight, ShieldCheck, Clock, Banknote } from 'lucide-react';

interface ExternalTransferProgressProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const ExternalTransferProgress = ({ isVisible, onComplete }: ExternalTransferProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Initiating ACH request',
    'Connecting to clearing house',
    'Verifying external account',
    'Processing through ACH network',
    'Confirming with receiving bank',
    'Completing transfer'
  ];

  const stepIcons = [Banknote, ArrowLeftRight, ShieldCheck, Building2, Clock, CheckCircle];

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return 100;
        }
        const newProgress = prev + 1.3;
        setCurrentStep(Math.min(Math.floor(newProgress / 17), steps.length - 1));
        return newProgress;
      });
    }, 85);

    return () => clearInterval(interval);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const StepIcon = stepIcons[currentStep];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] z-50 flex items-center justify-center p-4">
      {/* Animated bank network nodes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Left bank node */}
        <div className="absolute top-1/2 left-[15%] -translate-y-1/2">
          <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center animate-pulse">
            <Building2 className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-xs text-white/50 text-center mt-2">Heritage</p>
        </div>
        {/* Right bank node */}
        <div className="absolute top-1/2 right-[15%] -translate-y-1/2">
          <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center animate-pulse" style={{ animationDelay: '0.5s' }}>
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-xs text-white/50 text-center mt-2">External</p>
        </div>
        {/* Connecting line with moving dot */}
        <div className="absolute top-1/2 left-[25%] right-[25%] -translate-y-1/2 h-px bg-gradient-to-r from-emerald-400/40 via-heritage-gold/60 to-blue-400/40">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-heritage-gold"
            style={{
              left: `${progress}%`,
              boxShadow: '0 0 12px rgba(212, 175, 55, 0.8)',
              transition: 'left 0.3s ease-out'
            }}
          />
        </div>
      </div>

      <Card className="w-full max-w-md animate-scale-in bg-white/95 backdrop-blur-sm shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-heritage-gold to-blue-500" />

        <CardContent className="p-8 text-center space-y-6">
          {/* Dual bank icon */}
          <div className="relative w-28 h-28 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-300/40" style={{ animation: 'spin 8s linear infinite' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-lg">
                <ArrowLeftRight className="w-10 h-10 text-white" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' }} />
              </div>
            </div>
            {/* Orbiting bank icons */}
            {[0, 180].map((offset, i) => {
              const angle = ((progress * 3.6) + offset) * (Math.PI / 180);
              return (
                <div
                  key={i}
                  className="absolute w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
                  style={{
                    top: `${50 + Math.sin(angle) * 42}%`,
                    left: `${50 + Math.cos(angle) * 42}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <Building2 className={`w-3.5 h-3.5 ${i === 0 ? 'text-emerald-600' : 'text-blue-600'}`} />
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#1e3a5f]">ACH Transfer</h3>
            <p className="text-sm text-muted-foreground">Automated Clearing House Network</p>

            {/* Progress bar */}
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
                <circle
                  cx="50" cy="50" r="40"
                  stroke="url(#achGrad)"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={251.33}
                  strokeDashoffset={251.33 - (progress / 100) * 251.33}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                <defs>
                  <linearGradient id="achGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-[#1e3a5f]">{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Current step */}
            <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg">
              <StepIcon className="w-4 h-4 text-emerald-600 animate-pulse" />
              <p className="text-sm font-medium text-[#1e3a5f]">{steps[currentStep]}</p>
            </div>

            <div className="flex justify-center gap-1.5">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= currentStep ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            {progress === 100 && (
              <div className="flex items-center justify-center gap-2 text-green-600 animate-fade-in pt-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Transfer Initiated!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
