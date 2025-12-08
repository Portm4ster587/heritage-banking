import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home, Copy, Check, X, Share2, Mail, MessageCircle, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AnimatedHeritageLogo } from './AnimatedHeritageLogo';
import { useToast } from '@/hooks/use-toast';
import { HeritageLoadingScreen } from './HeritageLoadingScreen';

interface TransferSuccessScreenProps {
  amount: number;
  fromAccount: string;
  toAccount: string;
  onClose: () => void;
  transactionId?: string;
  fromAccountNumber?: string;
  fromRoutingNumber?: string;
  toAccountNumber?: string;
  toRoutingNumber?: string;
  recipientName?: string;
}

export const TransferSuccessScreen = ({
  amount,
  fromAccount,
  toAccount,
  onClose,
  transactionId,
  fromAccountNumber,
  fromRoutingNumber,
  toAccountNumber,
  toRoutingNumber,
  recipientName
}: TransferSuccessScreenProps) => {
  const [showContent, setShowContent] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showSharing, setShowSharing] = useState(false);
  const [navigatingToDashboard, setNavigatingToDashboard] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const generatedTxId = transactionId || `HBT${Date.now().toString(36).toUpperCase()}`;

  useEffect(() => {
    setTimeout(() => setShowContent(true), 500);
  }, []);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    toast({
      title: "Copied!",
      description: `${field} copied to clipboard`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGoToDashboard = () => {
    setNavigatingToDashboard(true);
    setTimeout(() => {
      onClose();
      navigate('/dashboard');
    }, 1500);
  };

  const getLastFour = (str?: string) => {
    if (!str) return '****';
    return str.slice(-4);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Heritage Bank Transfer Receipt');
    const body = encodeURIComponent(`
Transfer Confirmation

Amount: $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
Transaction ID: ${generatedTxId}

From: ${fromAccount}
Account: ****${getLastFour(fromAccountNumber)}

To: ${recipientName || toAccount}
Account: ****${getLastFour(toAccountNumber)}

Date: ${new Date().toLocaleDateString()}

Heritage Bank - Secure Banking
    `);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setShowSharing(false);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`
🏦 Heritage Bank Transfer Receipt

💰 Amount: $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
🔖 Transaction ID: ${generatedTxId}

From: ${fromAccount} (****${getLastFour(fromAccountNumber)})
To: ${recipientName || toAccount} (****${getLastFour(toAccountNumber)})

📅 Date: ${new Date().toLocaleDateString()}
    `);
    window.open(`https://wa.me/?text=${text}`);
    setShowSharing(false);
  };

  const copyReceiptLink = () => {
    const receiptData = btoa(JSON.stringify({
      txId: generatedTxId,
      amount,
      from: fromAccount,
      to: recipientName || toAccount,
      date: new Date().toISOString()
    }));
    const link = `${window.location.origin}/receipt/${receiptData}`;
    copyToClipboard(link, 'Receipt link');
    setShowSharing(false);
  };

  if (navigatingToDashboard) {
    return <HeritageLoadingScreen message="Returning to dashboard..." />;
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4">
      {/* Animated glowing background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Green success glow */}
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.25) 0%, transparent 70%)',
            top: '20%',
            left: '20%',
          }}
        />
        {/* Blue glow */}
        <div 
          className="absolute w-80 h-80 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(30, 58, 95, 0.2) 0%, transparent 70%)',
            bottom: '20%',
            right: '20%',
            animation: 'float 4s ease-in-out infinite reverse'
          }}
        />
        {/* Gold accent */}
        <div 
          className="absolute w-64 h-64 rounded-full blur-2xl"
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
            top: '50%',
            right: '30%',
          }}
        />
      </div>

      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 hover:bg-gray-100 rounded-full"
      >
        <X className="w-5 h-5 text-gray-500" />
      </Button>

      <Card className="relative w-full max-w-md bg-white/98 backdrop-blur-sm animate-scale-in shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="p-6 text-center space-y-5">
          {/* Success Icon with Green Checkmark */}
          <div className="relative w-28 h-28 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatedHeritageLogo 
                size="md" 
                isActive={true} 
                variant="success" 
              />
            </div>
            <div className="absolute -top-1 -right-1 w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-scale-in shadow-lg ring-4 ring-white" style={{ animationDelay: '0.5s' }}>
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
          </div>

          {showContent && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-green-600 mb-1">
                  Transfer Successful!
                </h2>
                <p className="text-sm text-muted-foreground">Your funds have been transferred securely</p>
              </div>

              {/* Amount Display */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                <p className="text-xs text-green-600 mb-1">Amount Transferred</p>
                <p className="text-3xl font-bold text-green-700">
                  ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Transfer Details */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-left border border-gray-100">
                {/* From Account */}
                <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">From</p>
                  <p className="font-semibold text-heritage-blue">{fromAccount}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Account: ****{getLastFour(fromAccountNumber)}</span>
                    <span>Routing: ****{getLastFour(fromRoutingNumber)}</span>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <div className="w-8 h-8 bg-heritage-gold/20 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-heritage-gold" />
                  </div>
                </div>
                
                {/* To Account */}
                <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">To</p>
                  <p className="font-semibold text-heritage-blue">{recipientName || toAccount}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Account: ****{getLastFour(toAccountNumber)}</span>
                    {toRoutingNumber && <span>Routing: ****{getLastFour(toRoutingNumber)}</span>}
                  </div>
                </div>
              </div>

              {/* Transaction ID */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-sm font-medium">{generatedTxId}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedTxId, 'Transaction ID')}
                  className="h-8 w-8 p-0"
                >
                  {copied === 'Transaction ID' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Share Options */}
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowSharing(!showSharing)}
                  className="w-full border-heritage-blue/20 text-heritage-blue hover:bg-heritage-blue/5"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Receipt
                </Button>

                {showSharing && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 animate-scale-in z-10">
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={shareViaWhatsApp}
                        className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-green-50"
                      >
                        <MessageCircle className="w-5 h-5 text-green-600" />
                        <span className="text-xs">WhatsApp</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={shareViaEmail}
                        className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-blue-50"
                      >
                        <Mail className="w-5 h-5 text-blue-600" />
                        <span className="text-xs">Email</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyReceiptLink}
                        className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-gray-50"
                      >
                        <Link2 className="w-5 h-5 text-gray-600" />
                        <span className="text-xs">Copy Link</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                <Button 
                  onClick={handleGoToDashboard}
                  className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#0d1b2a] hover:from-[#0d1b2a] hover:to-[#1e3a5f] text-white font-semibold py-5"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Back to Dashboard
                </Button>
                <Button 
                  onClick={onClose}
                  variant="outline"
                  className="w-full border-heritage-gold text-heritage-blue hover:bg-heritage-gold/10 font-semibold"
                >
                  Make Another Transfer
                </Button>
              </div>

              {/* Timestamp */}
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
