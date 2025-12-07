import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AnimatedHeritageLogo } from './AnimatedHeritageLogo';
import { useToast } from '@/hooks/use-toast';

interface TransferSuccessScreenProps {
  amount: number;
  fromAccount: string;
  toAccount: string;
  onClose: () => void;
  transactionId?: string;
}

export const TransferSuccessScreen = ({
  amount,
  fromAccount,
  toAccount,
  onClose,
  transactionId
}: TransferSuccessScreenProps) => {
  const [showContent, setShowContent] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const generatedTxId = transactionId || `HBT${Date.now().toString(36).toUpperCase()}`;

  useEffect(() => {
    setTimeout(() => setShowContent(true), 500);
  }, []);

  const copyTransactionId = async () => {
    await navigator.clipboard.writeText(generatedTxId);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Transaction ID copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToDashboard = () => {
    onClose();
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0d1b2a]/98 via-[#1e3a5f]/98 to-[#0d1b2a]/98 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-heritage-gold/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-green-400/10 rounded-full blur-xl animate-float" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <Card className="relative w-full max-w-md bg-white/95 backdrop-blur-sm animate-scale-in shadow-2xl">
        <div className="p-8 text-center space-y-6">
          {/* Success Icon with Green Checkmark */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatedHeritageLogo 
                size="lg" 
                isActive={true} 
                variant="success" 
              />
            </div>
            <div className="absolute -top-1 -right-1 w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-scale-in shadow-lg ring-4 ring-white" style={{ animationDelay: '0.5s' }}>
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>

          {showContent && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold text-green-600 mb-2">
                  Transfer Successful!
                </h2>
                <p className="text-muted-foreground">Your funds have been transferred</p>
              </div>

              {/* Amount Display */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <p className="text-sm text-green-600 mb-1">Amount Transferred</p>
                <p className="text-4xl font-bold text-green-700">
                  ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Transfer Details */}
              <div className="bg-gradient-to-br from-[#1e3a5f]/5 to-heritage-gold/5 rounded-lg p-4 space-y-4 text-left border border-heritage-blue/10">
                <div className="space-y-3">
                  <div className="flex items-start justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">From</p>
                      <p className="font-semibold text-heritage-blue">{fromAccount}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="w-8 h-8 bg-heritage-gold/20 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-heritage-gold" />
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">To</p>
                      <p className="font-semibold text-heritage-blue">{toAccount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction ID */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-sm">{generatedTxId}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyTransactionId}
                  className="h-8 w-8 p-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                <Button 
                  onClick={handleGoToDashboard}
                  className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#0d1b2a] hover:from-[#0d1b2a] hover:to-[#1e3a5f] text-white font-semibold py-6 text-lg"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Button>
                <Button 
                  onClick={onClose}
                  variant="outline"
                  className="w-full border-heritage-gold text-heritage-blue hover:bg-heritage-gold/10 font-semibold"
                >
                  Make Another Transfer
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
