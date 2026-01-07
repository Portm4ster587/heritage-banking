import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Send, Globe, Building2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
}

interface WireTransferFormProps {
  accounts: Account[];
  onSuccess?: () => void;
}

export const WireTransferForm = ({ accounts, onSuccess }: WireTransferFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transferType, setTransferType] = useState<'domestic' | 'international'>('domestic');
  const [fromAccount, setFromAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [recipientRouting, setRecipientRouting] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientSwift, setRecipientSwift] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [purpose, setPurpose] = useState('');
  const [proCode, setProCode] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'phone' | 'email'>('phone');
  const [verificationContact, setVerificationContact] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const domesticFee = 25;
  const internationalFee = 45;
  const fee = transferType === 'domestic' ? domesticFee : internationalFee;

  const handleSubmit = async () => {
    if (!fromAccount || !amount || !recipientName || !recipientBank || !recipientAccount) {
      toast({ title: "Missing Information", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    if (transferType === 'domestic' && !recipientRouting) {
      toast({ title: "Missing Routing Number", description: "Routing number is required for domestic wires", variant: "destructive" });
      return;
    }

    if (transferType === 'international' && !recipientSwift) {
      toast({ title: "Missing SWIFT Code", description: "SWIFT/BIC code is required for international wires", variant: "destructive" });
      return;
    }

    // Pro code verification required
    if (!proCode || proCode.length < 6) {
      toast({ title: "Pro Code Required", description: "Please enter your 6-digit Pro Code for wire transfer verification", variant: "destructive" });
      return;
    }

    if (!verificationContact) {
      toast({ title: "Verification Contact Required", description: `Please enter your ${verificationMethod === 'phone' ? 'phone number' : 'email'} for verification`, variant: "destructive" });
      return;
    }

    const account = accounts.find(a => a.id === fromAccount);
    const totalAmount = parseFloat(amount) + fee;
    
    if (account && account.balance < totalAmount) {
      toast({ title: "Insufficient Funds", description: `You need $${totalAmount.toFixed(2)} including fees`, variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase.from('wire_transfers').insert({
        user_id: user?.id,
        from_account_id: fromAccount,
        amount: parseFloat(amount),
        transfer_type: transferType,
        recipient_name: recipientName,
        recipient_bank: recipientBank,
        recipient_routing: recipientRouting || null,
        recipient_account: recipientAccount,
        recipient_swift: recipientSwift || null,
        recipient_address: recipientAddress || null,
        purpose: purpose || null,
        fee_amount: fee,
        reference_number: `WIRE-${Date.now()}`,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Wire Transfer Submitted",
        description: "Your wire transfer request is pending admin approval.",
      });

      // Reset form
      setAmount('');
      setRecipientName('');
      setRecipientBank('');
      setRecipientRouting('');
      setRecipientAccount('');
      setRecipientSwift('');
      setRecipientAddress('');
      setPurpose('');
      
      onSuccess?.();
    } catch (error) {
      console.error('Wire transfer error:', error);
      toast({ title: "Error", description: "Failed to submit wire transfer", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="banking-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Wire Transfer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Transfer Type</Label>
          <RadioGroup 
            value={transferType} 
            onValueChange={(v) => setTransferType(v as 'domestic' | 'international')}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="domestic" id="domestic" />
              <Label htmlFor="domestic" className="flex items-center gap-2 cursor-pointer">
                <Building2 className="w-4 h-4" />
                Domestic (${domesticFee} fee)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="international" id="international" />
              <Label htmlFor="international" className="flex items-center gap-2 cursor-pointer">
                <Globe className="w-4 h-4" />
                International (${internationalFee} fee)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>From Account</Label>
            <Select value={fromAccount} onValueChange={setFromAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.account_type.replace('_', ' ')} - ${account.balance.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount (USD)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
            />
          </div>
        </div>

        <div className="border-t pt-4 space-y-4">
          <h4 className="font-medium">Recipient Information</h4>
          
          <div className="space-y-2">
            <Label>Recipient Name</Label>
            <Input placeholder="Full name or business name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Recipient Bank</Label>
            <Input placeholder="Bank name" value={recipientBank} onChange={(e) => setRecipientBank(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transferType === 'domestic' ? (
              <div className="space-y-2">
                <Label>Routing Number (ABA)</Label>
                <Input placeholder="9-digit routing number" value={recipientRouting} onChange={(e) => setRecipientRouting(e.target.value)} maxLength={9} />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>SWIFT/BIC Code</Label>
                <Input placeholder="SWIFT code" value={recipientSwift} onChange={(e) => setRecipientSwift(e.target.value)} maxLength={11} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Account Number {transferType === 'international' && '/ IBAN'}</Label>
              <Input placeholder="Account number" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} />
            </div>
          </div>

          {transferType === 'international' && (
            <div className="space-y-2">
              <Label>Recipient Address (Optional)</Label>
              <Textarea placeholder="Full address" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} />
            </div>
          )}

          <div className="space-y-2">
            <Label>Purpose (Optional)</Label>
            <Input placeholder="e.g., Invoice payment, Gift, etc." value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>

          {/* Pro Code Verification Section */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-4 text-primary flex items-center gap-2">
              🔐 Security Verification (Required)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Verification Method</Label>
                <RadioGroup 
                  value={verificationMethod} 
                  onValueChange={(v) => setVerificationMethod(v as 'phone' | 'email')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="verify-phone" />
                    <Label htmlFor="verify-phone" className="cursor-pointer">Phone</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="verify-email" />
                    <Label htmlFor="verify-email" className="cursor-pointer">Email</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>{verificationMethod === 'phone' ? 'Phone Number' : 'Email Address'}</Label>
                <Input 
                  placeholder={verificationMethod === 'phone' ? '+1 (555) 123-4567' : 'your@email.com'}
                  value={verificationContact} 
                  onChange={(e) => setVerificationContact(e.target.value)}
                  type={verificationMethod === 'email' ? 'email' : 'tel'}
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>Pro Code (6-digit verification code)</Label>
              <Input 
                placeholder="Enter 6-digit Pro Code" 
                value={proCode} 
                onChange={(e) => setProCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="font-mono text-center text-lg tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Your Pro Code was sent to you during account setup. Contact support if you need a new code.
              </p>
            </div>
          </div>
        </div>

        {amount && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Transfer Amount:</span>
              <span>${parseFloat(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Wire Fee:</span>
              <span>${fee}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total:</span>
              <span>${(parseFloat(amount) + fee).toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            Wire transfers are processed during business hours and require admin approval. 
            Please verify all recipient details carefully as wire transfers cannot be reversed.
          </p>
        </div>

        <Button onClick={handleSubmit} disabled={isProcessing} className="w-full banking-button">
          {isProcessing ? "Submitting..." : `Submit Wire Transfer`}
        </Button>
      </CardContent>
    </Card>
  );
};
