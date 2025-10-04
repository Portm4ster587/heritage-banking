import { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AnimatedHeritageLogo } from './AnimatedHeritageLogo';

interface TransferSuccessScreenProps {
  amount: number;
  fromAccount: string;
  toAccount: string;
  onClose: () => void;
}

export const TransferSuccessScreen = ({
  amount,
  fromAccount,
  toAccount,
  onClose
}: TransferSuccessScreenProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 500);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-heritage-blue/95 via-heritage-blue-dark/95 to-heritage-blue/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-heritage-gold/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-success/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="relative w-full max-w-md bg-white/95 backdrop-blur-sm animate-scale-in">
        <div className="p-8 text-center space-y-6">
          {/* Success Icon with Animation */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0">
              <AnimatedHeritageLogo 
                size="lg" 
                isActive={true} 
                variant="success" 
              />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-success rounded-full flex items-center justify-center animate-scale-in shadow-lg" style={{ animationDelay: '0.5s' }}>
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
          </div>

          {showContent && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-3xl font-bold text-heritage-blue">
                Transfer Successful!
              </h2>
              
              <div className="space-y-2 text-muted-foreground">
                <p className="text-lg">Transfer completed successfully</p>
              </div>

              {/* Transfer Details */}
              <div className="bg-gradient-to-br from-heritage-blue/5 to-heritage-gold/5 rounded-lg p-4 space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-2xl font-bold text-success">
                    ${amount.toFixed(2)}
                  </span>
                </div>
                
                <Separator className="bg-heritage-blue/10" />
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-muted-foreground flex-1">From</span>
                    <span className="font-medium text-heritage-blue">{fromAccount}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-heritage-gold" />
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-muted-foreground flex-1">To</span>
                    <span className="font-medium text-heritage-blue">{toAccount}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button 
                  onClick={onClose}
                  className="w-full bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-blue font-semibold"
                >
                  Done
                </Button>
                <p className="text-xs text-muted-foreground">
                  Transaction ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const Separator = ({ className }: { className?: string }) => (
  <div className={`h-px bg-border ${className}`} />
);
