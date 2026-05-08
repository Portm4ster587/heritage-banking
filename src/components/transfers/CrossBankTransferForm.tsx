import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Send, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
}

interface Props {
  accounts: Account[];
  onSuccess?: () => void;
}

const PARTNER_BANKS = [
  { code: 'acfcu', name: 'America\'s Christian Federal Credit Union (ACFCU)' },
];

const THRESHOLD = 50000;

export const CrossBankTransferForm = ({ accounts, onSuccess }: Props) => {
  const { toast } = useToast();
  const [partnerBank, setPartnerBank] = useState('acfcu');
  const [fromAccount, setFromAccount] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const amt = parseFloat(amount) || 0;
  const requiresApproval = amt >= THRESHOLD;
  const source = accounts.find(a => a.id === fromAccount);

  const formatType = (t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const handleSubmit = async () => {
    if (!fromAccount || !recipientAccount || !recipientName || !amount) {
      toast({ title: 'Missing information', description: 'Fill in all required fields', variant: 'destructive' });
      return;
    }
    if (!/^\d{10}$/.test(recipientAccount)) {
      toast({ title: 'Invalid account number', description: 'Recipient account must be 10 digits', variant: 'destructive' });
      return;
    }
    if (source && (source.balance ?? 0) < amt) {
      toast({ title: 'Insufficient funds', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-cross-bank-transfer', {
        body: {
          fromAccountId: fromAccount,
          recipientAccountNumber: recipientAccount,
          recipientName,
          amount: amt,
          partnerBank,
          memo: memo || null,
        }
      });
      if (error) throw new Error(error.message || 'Transfer failed');
      if (data?.error) throw new Error(data.error);

      if (data.status === 'pending') {
        toast({
          title: 'Pending admin review',
          description: `Your $${amt.toLocaleString()} transfer is held for approval. You'll be notified once approved.`,
        });
      } else {
        toast({
          title: 'Transfer completed',
          description: `Sent $${amt.toLocaleString()} to ${recipientName}.`,
        });
      }
      setRecipientAccount(''); setRecipientName(''); setAmount(''); setMemo('');
      onSuccess?.();
    } catch (e: any) {
      toast({ title: 'Transfer failed', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="hightech-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Cross-Bank Transfer
          <Badge variant="secondary" className="ml-2">Heritage ↔ Partner Banks</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Send funds to recipient accounts at partner institutions. Transfers under ${THRESHOLD.toLocaleString()} complete instantly. Larger transfers require dual approval.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>Partner Bank</Label>
          <Select value={partnerBank} onValueChange={setPartnerBank}>
            <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PARTNER_BANKS.map(b => <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>From Account</Label>
          <Select value={fromAccount} onValueChange={setFromAccount}>
            <SelectTrigger className="h-12"><SelectValue placeholder="Select source account" /></SelectTrigger>
            <SelectContent>
              {accounts.map(a => (
                <SelectItem key={a.id} value={a.id}>
                  {formatType(a.account_type)} (...{a.account_number.slice(-4)}) — ${(a.balance ?? 0).toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Recipient Account Number (10 digits)</Label>
          <Input
            value={recipientAccount}
            onChange={e => setRecipientAccount(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="0000000000"
            inputMode="numeric"
            className="h-12 font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label>Recipient Name</Label>
          <Input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="John Doe" className="h-12" />
        </div>

        <div className="space-y-2">
          <Label>Amount (USD)</Label>
          <Input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="h-12" />
        </div>

        <div className="space-y-2">
          <Label>Memo (optional)</Label>
          <Textarea value={memo} onChange={e => setMemo(e.target.value)} rows={2} placeholder="Note for this transfer" />
        </div>

        {amt > 0 && (
          requiresApproval ? (
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <strong>Pending approval required.</strong> Transfers ≥ ${THRESHOLD.toLocaleString()} are held until both Heritage admin and the partner bank approve. Funds will be reserved from your available balance.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Instant transfer.</strong> Under ${THRESHOLD.toLocaleString()} — funds will be debited and posted immediately.
              </AlertDescription>
            </Alert>
          )
        )}

        <Button onClick={handleSubmit} disabled={submitting} className="w-full banking-button">
          {submitting ? 'Processing...' : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {requiresApproval ? 'Submit for Approval' : 'Send Transfer'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
