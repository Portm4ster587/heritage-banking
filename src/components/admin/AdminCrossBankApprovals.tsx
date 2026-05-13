import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Loader2, Network } from 'lucide-react';
import { format } from 'date-fns';

export function AdminCrossBankApprovals() {
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [declineFor, setDeclineFor] = useState<any | null>(null);
  const [reason, setReason] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('cross_bank_transfers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel('admin-cross-bank')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cross_bank_transfers' }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const decide = async (id: string, action: 'approve' | 'decline', reasonText?: string) => {
    setBusyId(id);
    try {
      const { data, error } = await supabase.functions.invoke('admin-cross-bank-decision', {
        body: { transferId: id, action, reason: reasonText }
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error || error?.message);
      toast({ title: action === 'approve' ? 'Transfer approved' : 'Transfer declined' });
      setDeclineFor(null);
      setReason('');
      await load();
    } catch (e: any) {
      toast({ title: 'Action failed', description: e.message, variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  const statusBadge = (s: string) => {
    if (s === 'completed') return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">Completed</Badge>;
    if (s === 'pending') return <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30">Pending Approval</Badge>;
    if (s === 'declined') return <Badge className="bg-rose-500/15 text-rose-700 border-rose-500/30">Declined</Badge>;
    return <Badge variant="outline">{s}</Badge>;
  };

  const pending = rows.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Cross-Bank Transfer Approvals
          </CardTitle>
          <CardDescription>
            Review and approve transfers ≥ $50,000. {pending.length} pending.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No cross-bank transfers yet</TableCell></TableRow>
                ) : rows.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">{format(new Date(r.created_at), 'MMM d, HH:mm')}</TableCell>
                    <TableCell>
                      <div className="font-medium">{r.recipient_name}</div>
                      <div className="text-xs text-muted-foreground">{r.recipient_account_number}</div>
                    </TableCell>
                    <TableCell className="uppercase text-xs">{r.partner_bank}</TableCell>
                    <TableCell className="text-right font-semibold">${Number(r.amount).toLocaleString()}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell className="text-right">
                      {r.status === 'pending' ? (
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" onClick={() => decide(r.id, 'approve')} disabled={busyId === r.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {busyId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1" />Approve</>}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setDeclineFor(r)} disabled={busyId === r.id}>
                            <XCircle className="w-4 h-4 mr-1" />Decline
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{r.declined_reason || '—'}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!declineFor} onOpenChange={(o) => !o && setDeclineFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline transfer</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ${Number(declineFor?.amount || 0).toLocaleString()} to {declineFor?.recipient_name}
          </p>
          <Textarea placeholder="Reason for declining…" value={reason} onChange={e => setReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineFor(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => declineFor && decide(declineFor.id, 'decline', reason)} disabled={!reason.trim()}>
              Decline transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
