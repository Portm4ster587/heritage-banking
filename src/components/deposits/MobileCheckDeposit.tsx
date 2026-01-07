import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Check, X, FileText, Image, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
}

interface MobileCheckDepositProps {
  accounts: Account[];
  onSuccess?: () => void;
}

export const MobileCheckDeposit = ({ accounts, onSuccess }: MobileCheckDepositProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [payerName, setPayerName] = useState('');
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'details' | 'front' | 'back' | 'review'>('details');
  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = (side: 'front' | 'back', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (side === 'front') {
          setFrontImage(base64);
          setStep('back');
        } else {
          setBackImage(base64);
          setStep('review');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAccount || !amount || !checkNumber || !payerName || !frontImage || !backImage) {
      toast({ title: "Missing Information", description: "Please complete all fields and capture both sides of the check", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase.from('check_deposits').insert({
        user_id: user?.id,
        account_id: selectedAccount,
        amount: parseFloat(amount),
        check_number: checkNumber,
        payer_name: payerName,
        bank_name: bankName || null,
        routing_number: routingNumber || null,
        check_front_url: frontImage,
        check_back_url: backImage,
        status: 'pending'
      });

      if (error) throw error;

      // Notify admin
      await supabase.from('admin_notifications').insert({
        type: 'check_deposit',
        title: 'New Mobile Check Deposit',
        message: `${payerName} submitted a check deposit of $${parseFloat(amount).toLocaleString()}`,
        priority: 'high',
        related_type: 'check_deposit'
      });

      toast({
        title: "Check Deposit Submitted!",
        description: "Your mobile check deposit is being reviewed. Funds will be available within 1-2 business days after approval.",
      });

      // Reset form
      setSelectedAccount('');
      setAmount('');
      setCheckNumber('');
      setPayerName('');
      setBankName('');
      setRoutingNumber('');
      setFrontImage(null);
      setBackImage(null);
      setStep('details');
      
      onSuccess?.();
    } catch (error) {
      console.error('Check deposit error:', error);
      toast({ title: "Error", description: "Failed to submit check deposit", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetCapture = () => {
    setFrontImage(null);
    setBackImage(null);
    setStep('details');
  };

  return (
    <Card className="banking-card bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" />
          Mobile Check Deposit
          <Badge variant="outline" className="ml-2">Camera Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {step === 'details' && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                📱 Deposit checks instantly by taking photos of the front and back. Funds are typically available within 1-2 business days.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deposit To</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_type.replace('_', ' ')} (...{account.account_number.slice(-4)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Check Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  className="bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Check Number</Label>
                <Input
                  placeholder="Check # from bottom of check"
                  value={checkNumber}
                  onChange={(e) => setCheckNumber(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Payer Name (From Check)</Label>
                <Input
                  placeholder="Name printed on check"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bank Name (Optional)</Label>
                <Input
                  placeholder="Issuing bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Routing Number (Optional)</Label>
                <Input
                  placeholder="9-digit routing number"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  maxLength={9}
                  className="bg-background"
                />
              </div>
            </div>

            <Button 
              onClick={() => setStep('front')} 
              disabled={!selectedAccount || !amount || !checkNumber || !payerName}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Camera className="w-4 h-4 mr-2" />
              Continue to Photo Capture
            </Button>
          </div>
        )}

        {step === 'front' && (
          <div className="space-y-4 text-center">
            <div className="p-6 border-2 border-dashed border-primary/50 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10">
              <Image className="w-16 h-16 mx-auto mb-4 text-primary/60" />
              <h3 className="text-lg font-semibold mb-2">Capture Front of Check</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Place check on a dark background. Ensure all corners are visible and text is readable.
              </p>
              <input
                ref={frontInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleImageCapture('front', e)}
                className="hidden"
              />
              <Button onClick={() => frontInputRef.current?.click()} className="banking-button">
                <Camera className="w-4 h-4 mr-2" />
                Take Photo of Front
              </Button>
            </div>
            <Button variant="outline" onClick={() => setStep('details')}>Back to Details</Button>
          </div>
        )}

        {step === 'back' && (
          <div className="space-y-4 text-center">
            <div className="mb-4">
              <Badge className="bg-green-500 mb-2">✓ Front Captured</Badge>
              {frontImage && (
                <img src={frontImage} alt="Check front" className="w-full max-w-xs mx-auto rounded-lg border shadow-md" />
              )}
            </div>
            <div className="p-6 border-2 border-dashed border-primary/50 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10">
              <Image className="w-16 h-16 mx-auto mb-4 text-primary/60" />
              <h3 className="text-lg font-semibold mb-2">Capture Back of Check</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sign the back of the check and write "For Mobile Deposit Only" before capturing.
              </p>
              <input
                ref={backInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleImageCapture('back', e)}
                className="hidden"
              />
              <Button onClick={() => backInputRef.current?.click()} className="banking-button">
                <Camera className="w-4 h-4 mr-2" />
                Take Photo of Back
              </Button>
            </div>
            <Button variant="outline" onClick={resetCapture}>Start Over</Button>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Review Your Check Deposit</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Front of Check</Label>
                {frontImage && (
                  <img src={frontImage} alt="Check front" className="w-full rounded-lg border shadow-md" />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Back of Check</Label>
                {backImage && (
                  <img src={backImage} alt="Check back" className="w-full rounded-lg border shadow-md" />
                )}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-muted/50 to-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">${parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check #:</span>
                <span className="font-mono">{checkNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">From:</span>
                <span>{payerName}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetCapture} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Retake Photos
              </Button>
              <Button onClick={handleSubmit} disabled={isProcessing} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                <Check className="w-4 h-4 mr-2" />
                {isProcessing ? "Submitting..." : "Submit Deposit"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};