import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Zap, Send, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
}

const DAILY_LIMIT = 5000;

export const ZelleTransferForm = ({ accounts, onSuccess }: { accounts: Account[]; onSuccess?: () => void }) => {
  const { toast } = useToast();
  const [fromAccount, setFromAccount] = useState('');
  const [recipientIdentifier, setRecipientIdentifier] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const amt = parseFloat(amount) || 0;
  const source = accounts.find(a => a.id === fromAccount);
  const formatType = (t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const handleSubmit = async () => {
    if (!fromAccount || !recipientIdentifier || !amount) {
      toast({ title: 'Missing information', description: 'Fill in all required fields', variant: 'destructive' });
      return;
    }
    if (amt > DAILY_LIMIT) {
      toast({ title: 'Over daily limit', description: `Zelle limit is $${DAILY_LIMIT.toLocaleString()}/day`, variant: 'destructive' });
      return;
    }
    if (source && (source.balance ?? 0) < amt) {
      toast({ title: 'Insufficient funds', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-zelle-transfer', {
        body: {
          fromAccountId: fromAccount,
          recipientIdentifier: recipientIdentifier.trim(),
          recipientName: recipientName.trim() || null,
          amount: amt,
          memo: memo || null,
        }
      });
      if (error) throw new Error(error.message || 'Zelle failed');
      if (data?.error) throw new Error(data.error);

      toast({
        title: data.status === 'completed' ? 'Zelle Sent Instantly' : 'Zelle Processing',
        description: data.status === 'completed'
          ? `$${amt.toLocaleString()} delivered to ${recipientName || recipientIdentifier}.`
          : `$${amt.toLocaleString()} to ${recipientName || recipientIdentifier} will arrive within 1 business day.`,
      });
      setRecipientIdentifier(''); setRecipientName(''); setAmount(''); setMemo('');
      onSuccess?.();
    } catch (e: any) {
      toast({ title: 'Zelle failed', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="hightech-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Send with Zelle
          <Badge variant="secondary" className="ml-2">Instant to Heritage members</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Send money fast with just an email or U.S. mobile number. Heritage-to-Heritage transfers arrive instantly; external Zelle within 1 business day.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
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
          <Label>Recipient Email or U.S. Mobile</Label>
          <Input
            value={recipientIdentifier}
            onChange={e => setRecipientIdentifier(e.target.value)}
            placeholder="name@email.com or (555) 123-4567"
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label>Recipient Name (optional)</Label>
          <Input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="John Doe" className="h-12" />
        </div>

        <div className="space-y-2">
          <Label>Amount (USD)</Label>
          <Input type="number" min="0" step="0.01" max={DAILY_LIMIT} value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="h-12" />
          <p className="text-xs text-muted-foreground">Daily limit: ${DAILY_LIMIT.toLocaleString()}</p>
        </div>

        <div className="space-y-2">
          <Label>Memo (optional)</Label>
          <Textarea value={memo} onChange={e => setMemo(e.target.value)} rows={2} placeholder="What's this for?" />
        </div>

        <Alert className="border-primary/40 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            Double-check the recipient — Zelle payments are typically irreversible once sent.
          </AlertDescription>
        </Alert>

        <Button onClick={handleSubmit} disabled={submitting} className="w-full banking-button">
          {submitting ? 'Sending...' : (<><Send className="h-4 w-4 mr-2" />Send with Zelle</>)}
        </Button>
      </CardContent>
    </Card>
  );
};
