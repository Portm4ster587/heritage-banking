import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRightLeft } from 'lucide-react';
import { AnimatedHeritageLogo } from './AnimatedHeritageLogo';

interface TransferProgressProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const EnhancedTransferProgress = ({ isVisible, onComplete }: TransferProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Validating transfer details',
    'Checking account balances', 
    'Processing transaction',
    'Updating account records',
    'Transfer completed'
  ];

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
          setTimeout(onComplete, 500);
          return 100;
        }
        
        const newProgress = prev + 2;
        setCurrentStep(Math.floor(newProgress / 20));
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardContent className="p-8 text-center space-y-6">
          {/* Animated Heritage Logo */}
          <div className="relative mx-auto mb-4">
            <AnimatedHeritageLogo 
              size="lg" 
              isActive={true} 
              variant="transfer"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Processing Transfer</h3>
            
            {/* Circular Progress */}
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke="hsl(var(--muted))"
                  strokeWidth="2"
                  fill="none"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={50.27}
                  strokeDashoffset={50.27 - (progress / 100) * 50.27}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Linear Progress */}
            <Progress value={progress} className="h-2" />
            
            {/* Current Step */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {steps[currentStep] || steps[steps.length - 1]}
              </p>
              
              {progress === 100 && (
                <div className="flex items-center justify-center space-x-2 text-success animate-fade-in">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Transfer Successful!</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};