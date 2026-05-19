import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Zap, Send, Info, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
}

const DAILY_LIMIT = 5000;

interface LookupResult {
  internal: boolean;
  recipientName: string | null;
  dailySent: number;
  dailyRemaining: number;
}

export const ZelleTransferForm = ({ accounts, onSuccess }: { accounts: Account[]; onSuccess?: () => void }) => {
  const { toast } = useToast();
  const [fromAccount, setFromAccount] = useState('');
  const [recipientIdentifier, setRecipientIdentifier] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lookup, setLookup] = useState<LookupResult | null>(null);
  const [looking, setLooking] = useState(false);
  const amt = parseFloat(amount) || 0;
  const source = accounts.find(a => a.id === fromAccount);
  const formatType = (t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const remaining = lookup ? lookup.dailyRemaining : DAILY_LIMIT;

  // Debounced recipient lookup
  useEffect(() => {
    const id = recipientIdentifier.trim();
    if (id.length < 3) { setLookup(null); return; }
    setLooking(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await supabase.functions.invoke('lookup-zelle-recipient', { body: { identifier: id } });
        if (data && !data.error) setLookup(data as LookupResult);
      } finally {
        setLooking(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [recipientIdentifier]);

  const handleSubmit = async () => {
    if (!fromAccount || !recipientIdentifier || !amount) {
      toast({ title: 'Missing information', description: 'Fill in all required fields', variant: 'destructive' });
      return;
    }
    if (amt > DAILY_LIMIT) {
      toast({ title: 'Over daily limit', description: `Zelle limit is $${DAILY_LIMIT.toLocaleString()}/day`, variant: 'destructive' });
      return;
    }
    if (lookup && amt > lookup.dailyRemaining) {
      toast({ title: 'Exceeds remaining daily limit', description: `Only $${lookup.dailyRemaining.toLocaleString()} left today.`, variant: 'destructive' });
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
          recipientName: recipientName.trim() || lookup?.recipientName || null,
          amount: amt,
          memo: memo || null,
        }
      });
      if (error) throw new Error(error.message || 'Zelle failed');
      if (data?.error) throw new Error(data.error);

      toast({
        title: data.status === 'completed' ? 'Zelle Sent Instantly' : 'Zelle Processing',
        description: data.status === 'completed'
          ? `$${amt.toLocaleString()} delivered to ${recipientName || lookup?.recipientName || recipientIdentifier}.`
          : `$${amt.toLocaleString()} to ${recipientName || recipientIdentifier} will arrive within 1 business day.`,
      });
      setRecipientIdentifier(''); setRecipientName(''); setAmount(''); setMemo(''); setLookup(null);
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
        <CardTitle className="flex items-center gap-2 flex-wrap">
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
          {recipientIdentifier.trim().length >= 3 && (
            <div className="flex items-center gap-2 text-xs">
              {looking ? (
                <span className="text-muted-foreground">Looking up recipient…</span>
              ) : lookup?.internal ? (
                <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Heritage member{lookup.recipientName ? ` · ${lookup.recipientName}` : ''} — instant
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-500/40 text-amber-600">
                  <Clock className="w-3 h-3 mr-1" />
                  External Zelle — delivery within 1 business day
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Recipient Name (optional)</Label>
          <Input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder={lookup?.recipientName || 'John Doe'} className="h-12" />
        </div>

        <div className="space-y-2">
          <Label>Amount (USD)</Label>
          <Input type="number" min="0" step="0.01" max={remaining} value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="h-12" />
          <p className="text-xs text-muted-foreground">
            Daily limit: ${DAILY_LIMIT.toLocaleString()} · Sent today: ${lookup ? lookup.dailySent.toLocaleString() : '0'} · Remaining: ${remaining.toLocaleString()}
          </p>
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
