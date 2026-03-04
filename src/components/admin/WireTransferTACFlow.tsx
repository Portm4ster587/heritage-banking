import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AdminTACSystem } from './AdminTACSystem';
import { KeyRound, CheckCircle, XCircle, Send, AlertTriangle } from 'lucide-react';

interface WireTransferTACFlowProps {
  transfer: {
    id: string;
    user_id: string;
    recipient_name: string;
    amount: number;
    from_account_id: string;
    fee_amount: number | null;
    status: string | null;
  };
  onComplete: () => void;
}

export const WireTransferTACFlow = ({ transfer, onComplete }: WireTransferTACFlowProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tacVerified, setTacVerified] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [userContact, setUserContact] = useState<{ phone?: string; email?: string }>({});

  useEffect(() => {
    fetchUserContact();
  }, [transfer.user_id]);

  const fetchUserContact = async () => {
    const [{ data: profile }, { data: authData }] = await Promise.all([
      supabase.from('profiles').select('phone').eq('user_id', transfer.user_id).maybeSingle(),
      supabase.auth.admin?.listUsers ? Promise.resolve({ data: null }) : Promise.resolve({ data: null })
    ]);
    setUserContact({ phone: profile?.phone || undefined });
  };

  const handleApprove = async () => {
    if (!tacVerified) {
      toast({ title: "TAC Required", description: "Please verify TAC code before approving", variant: "destructive" });
      return;
    }
    setProcessing(true);

    try {
      const { error } = await supabase
        .from('wire_transfers')
        .update({
          status: 'completed',
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
          admin_notes: adminNote || 'Approved with TAC verification'
        })
        .eq('id', transfer.id);

      if (error) throw error;

      // Deduct from account
      const { data: account } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', transfer.from_account_id)
        .single();

      if (account) {
        const totalDeduction = transfer.amount + (transfer.fee_amount || 0);
        await supabase
          .from('accounts')
          .update({ balance: account.balance - totalDeduction })
          .eq('id', transfer.from_account_id);
      }

      // Notify user
      await supabase.from('user_notifications').insert({
        user_id: transfer.user_id,
        type: 'transfer',
        title: '🌐 Wire Transfer Approved',
        message: `Your wire transfer of $${transfer.amount.toLocaleString()} to ${transfer.recipient_name} has been processed with TAC verification.`,
        priority: 'high'
      });

      // Send SMS
      if (userContact.phone) {
        await supabase.functions.invoke('send-sms-notification', {
          body: {
            to: userContact.phone,
            message: `Heritage Bank: Wire transfer of $${transfer.amount.toLocaleString()} to ${transfer.recipient_name} approved. Ref: ${transfer.id.slice(0, 8)}`,
            type: 'transfer'
          }
        });
      }

      toast({ title: "✅ Wire Transfer Approved", description: "TAC verified & transfer processed" });
      onComplete();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Failed to process transfer", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!adminNote) {
      toast({ title: "Note Required", description: "Please provide a reason for rejection", variant: "destructive" });
      return;
    }
    setProcessing(true);

    try {
      const { error } = await supabase
        .from('wire_transfers')
        .update({
          status: 'rejected',
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
          admin_notes: adminNote
        })
        .eq('id', transfer.id);

      if (error) throw error;

      await supabase.from('user_notifications').insert({
        user_id: transfer.user_id,
        type: 'transfer',
        title: '❌ Wire Transfer Rejected',
        message: `Your wire transfer of $${transfer.amount.toLocaleString()} was rejected. Reason: ${adminNote}`,
        priority: 'high'
      });

      toast({ title: "Transfer Rejected", description: "User notified" });
      onComplete();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Failed to reject", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-600" />
          TAC Verification Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* TAC Status */}
        <div className="flex items-center gap-2">
          {tacVerified ? (
            <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> TAC Verified</Badge>
          ) : (
            <Badge variant="outline" className="border-amber-500 text-amber-700">
              <AlertTriangle className="w-3 h-3 mr-1" /> TAC Not Verified
            </Badge>
          )}
        </div>

        {/* TAC Controls */}
        <AdminTACSystem
          userId={transfer.user_id}
          wireTransferId={transfer.id}
          userPhone={userContact.phone}
          onTACVerified={() => setTacVerified(true)}
        />

        {/* Admin Note */}
        <div>
          <Label className="text-sm">Admin Notes</Label>
          <Textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Notes (required for rejection)"
            className="mt-1"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleReject}
            variant="destructive"
            size="sm"
            disabled={!adminNote || processing}
          >
            <XCircle className="w-4 h-4 mr-1" /> Reject
          </Button>
          <Button
            onClick={handleApprove}
            size="sm"
            disabled={!tacVerified || processing}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-1" /> Approve with TAC
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
