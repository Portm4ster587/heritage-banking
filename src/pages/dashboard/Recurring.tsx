import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BackButton } from '@/components/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Plus, Pause, Play, X, Loader2, Repeat } from 'lucide-react';
import { format } from 'date-fns';

const FREQUENCIES = ['one_time','daily','weekly','biweekly','monthly'] as const;

export default function Recurring() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    transfer_kind: 'cross_bank',
    from_account_id: '',
    recipient_account_number: '',
    recipient_name: '',
    partner_bank: 'acfcu',
    amount: '',
    memo: '',
    frequency: 'monthly',
    next_run_at: new Date(Date.now() + 24*3600*1000).toISOString().slice(0,10),
    end_date: '',
  });

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [a, s] = await Promise.all([
      supabase.from('accounts').select('id,account_number,account_type,balance').eq('user_id', user.id),
      supabase.from('scheduled_transfers').select('*').eq('user_id', user.id).order('next_run_at')
    ]);
    setAccounts(a.data || []);
    setItems(s.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const submit = async () => {
    if (!user || !form.from_account_id || !form.amount || !form.recipient_account_number || !form.recipient_name) {
      toast({ title: 'Fill all required fields', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('scheduled_transfers').insert({
      user_id: user.id,
      transfer_kind: form.transfer_kind,
      from_account_id: form.from_account_id,
      recipient_account_number: form.recipient_account_number,
      recipient_name: form.recipient_name,
      partner_bank: form.partner_bank,
      amount: parseFloat(form.amount),
      memo: form.memo || null,
      frequency: form.frequency,
      next_run_at: new Date(form.next_run_at).toISOString(),
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
    });
    setSaving(false);
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Scheduled payment created' });
    setOpen(false);
    load();
  };

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('scheduled_transfers').update({ status }).eq('id', id);
    if (error) toast({ title: 'Update failed', variant: 'destructive' });
    else load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('scheduled_transfers').delete().eq('id', id);
    if (error) toast({ title: 'Delete failed', variant: 'destructive' });
    else load();
  };

  return (
    <main className="container mx-auto px-4 py-6"><BackButton to="/dashboard" label="Back" className="mb-4" />
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Repeat className="w-6 h-6" /> Recurring & Scheduled Payments</h1>
            <p className="text-sm text-muted-foreground">Automate cross-bank, internal, and ACH transfers</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-1" /> New</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Schedule a payment</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>From account</Label>
                  <Select value={form.from_account_id} onValueChange={v => setForm(f => ({...f, from_account_id: v}))}>
                    <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                    <SelectContent>
                      {accounts.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.account_type} •••{a.account_number.slice(-4)} (${Number(a.balance).toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    <Select value={form.transfer_kind} onValueChange={v => setForm(f => ({...f, transfer_kind: v}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cross_bank">Cross-Bank (ACFCU)</SelectItem>
                        <SelectItem value="heritage">Heritage Internal</SelectItem>
                        <SelectItem value="ach">ACH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <Select value={form.frequency} onValueChange={v => setForm(f => ({...f, frequency: v}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f.replace('_',' ')}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Recipient name</Label>
                  <Input value={form.recipient_name} onChange={e => setForm(f => ({...f, recipient_name: e.target.value}))} />
                </div>
                <div>
                  <Label>Recipient account number</Label>
                  <Input maxLength={10} value={form.recipient_account_number} onChange={e => setForm(f => ({...f, recipient_account_number: e.target.value.replace(/\D/g,'')}))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Amount</Label>
                    <Input type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} />
                  </div>
                  <div>
                    <Label>Next run</Label>
                    <Input type="date" value={form.next_run_at} onChange={e => setForm(f => ({...f, next_run_at: e.target.value}))} />
                  </div>
                </div>
                <div>
                  <Label>End date (optional)</Label>
                  <Input type="date" value={form.end_date} onChange={e => setForm(f => ({...f, end_date: e.target.value}))} />
                </div>
                <div>
                  <Label>Memo</Label>
                  <Input value={form.memo} onChange={e => setForm(f => ({...f, memo: e.target.value}))} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Schedule'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your schedule</CardTitle>
            <CardDescription>Manage active, paused, and cancelled payments</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin" /></div> :
             items.length === 0 ? <div className="text-center text-sm text-muted-foreground py-6">No scheduled payments yet.</div> :
             <div className="space-y-3">
              {items.map(it => (
                <div key={it.id} className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <div>
                    <div className="font-semibold">{it.recipient_name} • ${Number(it.amount).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3" />
                      Next: {format(new Date(it.next_run_at),'MMM d, yyyy')} • {it.frequency.replace('_',' ')} • {it.transfer_kind.replace('_',' ')}
                    </div>
                    {it.memo && <div className="text-xs text-muted-foreground mt-1">"{it.memo}"</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      it.status==='active' ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' :
                      it.status==='paused' ? 'bg-amber-500/15 text-amber-700 border-amber-500/30' :
                      'bg-rose-500/15 text-rose-700 border-rose-500/30'
                    }>{it.status}</Badge>
                    {it.status === 'active' && <Button size="sm" variant="outline" onClick={() => setStatus(it.id,'paused')}><Pause className="w-3 h-3" /></Button>}
                    {it.status === 'paused' && <Button size="sm" variant="outline" onClick={() => setStatus(it.id,'active')}><Play className="w-3 h-3" /></Button>}
                    <Button size="sm" variant="destructive" onClick={() => remove(it.id)}><X className="w-3 h-3" /></Button>
                  </div>
                </div>
              ))}
             </div>
            }
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
