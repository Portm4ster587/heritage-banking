import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { signIn } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: {
    id: string;
    card_number: string;
    cvv: string;
    expiry_date: string;
    card_type: string;
    card_network: string;
    last4: string;
  };
}

export const CardDetailsModal = ({ open, onOpenChange, card }: CardDetailsModalProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleVerifyPassword = async () => {
    if (!user?.email) return;

    setIsVerifying(true);
    try {
      const { error } = await signIn(user.email, password);
      
      if (error) {
        toast({
          title: "Verification Failed",
          description: "Incorrect password. Please try again.",
          variant: "destructive"
        });
        setPassword('');
      } else {
        setIsVerified(true);
        toast({
          title: "Verified",
          description: "You can now view your card details.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during verification.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setIsVerified(false);
    setShowCardNumber(false);
    setShowCVV(false);
    setShowPassword(false);
    onOpenChange(false);
  };

  const formatCardNumber = (number: string) => {
    return number.match(/.{1,4}/g)?.join(' ') || number;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Secure Card Details
          </DialogTitle>
          <DialogDescription>
            {!isVerified 
              ? "Enter your password to view sensitive card information"
              : "Your complete card details are shown below"}
          </DialogDescription>
        </DialogHeader>

        {!isVerified ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Lock className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verify-password">Account Password</Label>
              <div className="relative">
                <Input
                  id="verify-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleVerifyPassword} 
              disabled={isVerifying || !password}
              className="w-full banking-button"
            >
              {isVerifying ? "Verifying..." : "Verify & View Details"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Card Visual Preview */}
            <div className={cn(
              "relative h-48 bg-gradient-to-br p-6 flex flex-col justify-between rounded-lg overflow-hidden",
              card.card_type.toLowerCase() === 'platinum' || card.card_type.toLowerCase() === 'premium'
                ? 'from-slate-700 via-slate-800 to-slate-900'
                : 'from-primary via-primary/90 to-primary/80'
            )}>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
              </div>

              <div className="relative flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-xs uppercase tracking-wider">Heritage Bank</p>
                  <p className="text-white text-xs mt-1 capitalize font-semibold">{card.card_type}</p>
                </div>
                <CreditCard className="w-8 h-8 text-white/80" />
              </div>

              <div className="relative">
                <p className="text-white text-lg font-mono tracking-wider mb-2">
                  {showCardNumber ? formatCardNumber(card.card_number) : `•••• •••• •••• ${card.last4}`}
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-white/60 text-xs">Valid Thru</p>
                    <p className="text-white font-mono text-sm">{card.expiry_date}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">CVV</p>
                    <p className="text-white font-mono text-sm">
                      {showCVV ? card.cvv : '•••'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Card Number</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCardNumber(!showCardNumber)}
                    className="h-8"
                  >
                    {showCardNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Input
                  value={showCardNumber ? formatCardNumber(card.card_number) : `•••• •••• •••• ${card.last4}`}
                  readOnly
                  className="font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input value={card.expiry_date} readOnly className="font-mono" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>CVV</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCVV(!showCVV)}
                      className="h-6"
                    >
                      {showCVV ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                  <Input
                    value={showCVV ? card.cvv : '•••'}
                    readOnly
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Card Network</Label>
                <Input value={card.card_network.toUpperCase()} readOnly className="capitalize" />
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted text-sm">
              <Shield className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                Keep your card details secure. Never share your CVV or full card number with anyone.
              </p>
            </div>

            <Button onClick={handleClose} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
