import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import hihLogoAnimated from '@/assets/hih-logo-animated.png';

interface TransferHIHProgressProps {
  isVisible: boolean;
  onComplete: () => void;
  title?: string;
}

export const TransferHIHProgress = ({ isVisible, onComplete, title = 'Processing Transfer' }: TransferHIHProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [logoRotation, setLogoRotation] = useState(0);
  const [logoScale, setLogoScale] = useState(1);

  const steps = [
    'Validating transfer details',
    'Verifying account balances',
    'Securing transaction',
    'Processing with Heritage Bank',
    'Updating account records',
    'Finalizing transfer'
  ];

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setCurrentStep(0);
      setLogoRotation(0);
      setLogoScale(1);
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

    // Logo animation interval
    const logoInterval = setInterval(() => {
      setLogoRotation(prev => prev + 2);
      setLogoScale(prev => 1 + Math.sin(Date.now() / 500) * 0.05);
    }, 50);

    return () => {
      clearInterval(interval);
      clearInterval(logoInterval);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-heritage-blue/95 z-50 flex items-center justify-center p-4">
      {/* Animated glowing background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)', 
            top: '20%', 
            left: '10%' 
          }}
        />
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%)', 
            bottom: '20%', 
            right: '10%',
            animationDelay: '1s'
          }}
        />
      </div>

      <Card className="w-full max-w-md animate-scale-in bg-white/95 backdrop-blur-sm shadow-2xl relative overflow-hidden">
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-heritage-gold via-heritage-gold/50 to-heritage-gold" />

        <CardContent className="p-8 text-center space-y-6">
          {/* HIH Logo Image Animation */}
          <div className="flex justify-center mb-6">
            <div 
              className="relative w-48 h-48 flex items-center justify-center"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.5))'
              }}
            >
              {/* Rotating glow ring */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(212, 175, 55, 0.8), rgba(30, 58, 95, 0.8), rgba(212, 175, 55, 0.8), rgba(30, 58, 95, 0.8), rgba(212, 175, 55, 0.8))',
                  animation: 'spin 3s linear infinite',
                  padding: '4px',
                  borderRadius: '50%'
                }}
              >
                <div className="w-full h-full rounded-full bg-heritage-blue/90" />
              </div>
              
              {/* Inner glow */}
              <div 
                className="absolute inset-4 rounded-full animate-pulse"
                style={{
                  background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)',
                  filter: 'blur(10px)'
                }}
              />
              
              {/* Logo Image */}
              <img 
                src={hihLogoAnimated} 
                alt="HIH Logo" 
                className="relative z-10 w-32 h-32 object-contain transition-transform duration-100"
                style={{
                  transform: `scale(${logoScale})`,
                  filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))'
                }}
              />
              
              {/* Particle effects */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-heritage-gold rounded-full"
                  style={{
                    top: `${50 + Math.sin((logoRotation + i * 45) * Math.PI / 180) * 45}%`,
                    left: `${50 + Math.cos((logoRotation + i * 45) * Math.PI / 180) * 45}%`,
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.8,
                    boxShadow: '0 0 10px rgba(212, 175, 55, 0.8)'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-heritage-blue">{title}</h3>
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
                  stroke="url(#hihGoldGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={251.33}
                  strokeDashoffset={251.33 - (progress / 100) * 251.33}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                <defs>
                  <linearGradient id="hihGoldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
            </div>

            {/* Current Step */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-heritage-gold rounded-full animate-pulse" />
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
