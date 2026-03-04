import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Send, Copy, Phone, Mail } from 'lucide-react';

interface AdminTACSystemProps {
  userId: string;
  wireTransferId?: string;
  userPhone?: string;
  userEmail?: string;
  onTACVerified?: () => void;
}

export const AdminTACSystem = ({ userId, wireTransferId, userPhone, userEmail, onTACVerified }: AdminTACSystemProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'sms' | 'admin' | 'both'>('both');

  const generateTACCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleGenerateTAC = async () => {
    setProcessing(true);
    const code = generateTACCode();
    
    try {
      // Store TAC in database
      const { error } = await supabase.from('tac_codes' as any).insert({
        user_id: userId,
        wire_transfer_id: wireTransferId || null,
        code,
        status: 'pending',
        requested_by: user?.id,
        generated_by: user?.id,
        delivery_method: deliveryMethod,
      });

      if (error) throw error;

      // Send via SMS if selected
      if ((deliveryMethod === 'sms' || deliveryMethod === 'both') && userPhone) {
        await supabase.functions.invoke('send-sms-notification', {
          body: {
            to: userPhone,
            message: `Heritage Bank TAC Code: ${code}. This code expires in 15 minutes. Do not share this code with anyone. Ref: ${wireTransferId?.slice(0, 8) || 'N/A'}`,
            type: 'tac'
          }
        });
      }

      // Send via Email if selected
      if ((deliveryMethod === 'sms' || deliveryMethod === 'both') && userEmail) {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            to: userEmail,
            subject: 'Heritage Bank - Transaction Authorization Code',
            type: 'tac',
            data: { code, expiresIn: '15 minutes', referenceId: wireTransferId?.slice(0, 8) || 'N/A' }
          }
        });
      }

      setGeneratedCode(code);

      // Notify user in-app
      await supabase.from('user_notifications').insert({
        user_id: userId,
        type: 'security',
        title: '🔐 TAC Code Generated',
        message: `A Transaction Authorization Code has been sent to your registered contact. It expires in 15 minutes.`,
        priority: 'high'
      });

      toast({ title: "TAC Generated", description: `Code: ${code} - ${deliveryMethod === 'admin' ? 'Share manually' : 'Sent to user'}` });
    } catch (error) {
      console.error('Error generating TAC:', error);
      toast({ title: "Error", description: "Failed to generate TAC code", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyTAC = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase
        .from('tac_codes' as any)
        .select('*')
        .eq('user_id', userId)
        .eq('code', verifyCode)
        .eq('status', 'pending')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && (data as any[]).length > 0) {
        // Mark TAC as verified
        await supabase
          .from('tac_codes' as any)
          .update({ status: 'verified', verified_at: new Date().toISOString() })
          .eq('id', (data as any[])[0].id);

        toast({ title: "✅ TAC Verified", description: "Transaction authorization confirmed" });
        setShowVerifyDialog(false);
        setVerifyCode('');
        onTACVerified?.();
      } else {
        toast({ title: "❌ Invalid TAC", description: "Code is invalid or expired", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error verifying TAC:', error);
      toast({ title: "Error", description: "Failed to verify TAC code", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({ title: "Copied", description: "TAC code copied to clipboard" });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={() => setShowGenerateDialog(true)} className="border-amber-500 text-amber-700 hover:bg-amber-50">
        <KeyRound className="w-3 h-3 mr-1" /> Generate TAC
      </Button>
      <Button size="sm" variant="outline" onClick={() => setShowVerifyDialog(true)} className="border-green-500 text-green-700 hover:bg-green-50">
        <KeyRound className="w-3 h-3 mr-1" /> Verify TAC
      </Button>

      {/* Generate TAC Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-amber-500" /> Generate TAC Code</DialogTitle>
            <DialogDescription>Generate a Transaction Authorization Code for this user</DialogDescription>
          </DialogHeader>
          
          {!generatedCode ? (
            <div className="space-y-4">
              <div>
                <Label>Delivery Method</Label>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant={deliveryMethod === 'sms' ? 'default' : 'outline'} onClick={() => setDeliveryMethod('sms')}>
                    <Phone className="w-3 h-3 mr-1" /> SMS/Email
                  </Button>
                  <Button size="sm" variant={deliveryMethod === 'admin' ? 'default' : 'outline'} onClick={() => setDeliveryMethod('admin')}>
                    <Copy className="w-3 h-3 mr-1" /> Manual
                  </Button>
                  <Button size="sm" variant={deliveryMethod === 'both' ? 'default' : 'outline'} onClick={() => setDeliveryMethod('both')}>
                    <Send className="w-3 h-3 mr-1" /> Both
                  </Button>
                </div>
              </div>
              {userPhone && <p className="text-xs text-muted-foreground">Phone: {userPhone}</p>}
              {userEmail && <p className="text-xs text-muted-foreground">Email: {userEmail}</p>}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <p className="text-sm text-muted-foreground mb-2">Generated TAC Code</p>
                <p className="text-4xl font-mono font-bold tracking-[0.3em] text-amber-700">{generatedCode}</p>
                <p className="text-xs text-muted-foreground mt-2">Expires in 15 minutes</p>
              </div>
              <Button variant="outline" onClick={copyCode} className="w-full">
                <Copy className="w-4 h-4 mr-2" /> Copy Code
              </Button>
              {deliveryMethod !== 'admin' && (
                <Badge className="bg-green-500">✓ Sent to user via {deliveryMethod === 'both' ? 'SMS & Email' : 'SMS'}</Badge>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowGenerateDialog(false); setGeneratedCode(''); }}>Close</Button>
            {!generatedCode && (
              <Button onClick={handleGenerateTAC} disabled={processing} className="bg-amber-500 hover:bg-amber-600">
                <KeyRound className="w-4 h-4 mr-2" /> Generate Code
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify TAC Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-green-500" /> Verify TAC Code</DialogTitle>
            <DialogDescription>Enter the TAC code provided by the user</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>TAC Code</Label>
              <Input
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="text-center text-2xl font-mono tracking-[0.3em]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerifyDialog(false)}>Cancel</Button>
            <Button onClick={handleVerifyTAC} disabled={verifyCode.length !== 6 || processing} className="bg-green-600 hover:bg-green-700">
              Verify Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
