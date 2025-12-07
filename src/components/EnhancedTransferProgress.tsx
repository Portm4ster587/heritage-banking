import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { AnimatedHeritageLogo } from './AnimatedHeritageLogo';
import heritageLogo1 from '@/assets/heritage-logo-1.png';
import heritageLogo2 from '@/assets/heritage-logo-2.png';

interface TransferProgressProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const EnhancedTransferProgress = ({ isVisible, onComplete }: TransferProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [logoIndex, setLogoIndex] = useState(0);

  const steps = [
    'Validating transfer details',
    'Verifying account balances', 
    'Securing transaction',
    'Processing with Heritage Bank',
    'Updating account records',
    'Finalizing transfer'
  ];

  // Alternate logos for animation
  useEffect(() => {
    if (!isVisible) return;
    
    const logoInterval = setInterval(() => {
      setLogoIndex(prev => (prev + 1) % 2);
    }, 800);
    
    return () => clearInterval(logoInterval);
  }, [isVisible]);

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
        
        const newProgress = prev + 1.5;
        setCurrentStep(Math.min(Math.floor(newProgress / 17), steps.length - 1));
        return newProgress;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const logos = [heritageLogo1, heritageLogo2];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0d1b2a]/98 via-[#1e3a5f]/98 to-[#0d1b2a]/98 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-heritage-gold/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-heritage-gold/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-heritage-gold/5 rounded-full blur-xl animate-float" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <Card className="w-full max-w-md animate-scale-in bg-white/95 backdrop-blur-sm shadow-2xl relative overflow-hidden">
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-heritage-gold via-heritage-gold/50 to-heritage-gold"></div>
        
        <CardContent className="p-8 text-center space-y-6">
          {/* Animated Heritage Logo - Alternating */}
          <div className="relative mx-auto mb-6">
            <div className="w-28 h-28 relative mx-auto">
              {logos.map((logo, index) => (
                <img
                  key={index}
                  src={logo}
                  alt="Heritage Bank"
                  className={`absolute inset-0 w-full h-full object-contain transition-all duration-500 ${
                    logoIndex === index 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-95'
                  }`}
                  style={{
                    filter: 'drop-shadow(0 4px 12px rgba(212, 175, 55, 0.3))'
                  }}
                />
              ))}
            </div>
            
            {/* Pulsing ring */}
            <div className="absolute inset-0 w-28 h-28 mx-auto rounded-full border-2 border-heritage-gold/30 animate-ping" style={{ animationDuration: '2s' }}></div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-heritage-blue">Processing Transfer</h3>
            <p className="text-sm text-muted-foreground">Heritage Bank Secure Transfer</p>
            
            {/* Circular Progress */}
            <div className="relative w-28 h-28 mx-auto">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#goldGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={251.33}
                  strokeDashoffset={251.33 - (progress / 100) * 251.33}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#d4af37" />
                    <stop offset="100%" stopColor="#c5a028" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-heritage-blue">{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Linear Progress */}
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-heritage-gold to-heritage-gold/80 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/30 to-transparent rounded-full animate-pulse"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Current Step */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-heritage-gold rounded-full animate-pulse"></div>
                <p className="text-sm text-heritage-blue font-medium">
                  {steps[currentStep]}
                </p>
              </div>
              
              {/* Step indicators */}
              <div className="flex justify-center gap-1.5">
                {steps.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index <= currentStep 
                        ? 'bg-heritage-gold' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              {progress === 100 && (
                <div className="flex items-center justify-center space-x-2 text-green-600 animate-fade-in pt-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Transfer Successful!</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
