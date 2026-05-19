import { useEffect, useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Search, Zap, RefreshCw, Receipt } from 'lucide-react';

interface ZelleTx {
  id: string;
  amount: number;
  status: string;
  description: string | null;
  recipient_name: string | null;
  recipient_account: string | null;
  created_at: string;
  completed_at: string | null;
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Completed</Badge>;
    case 'pending':
      return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Processing</Badge>;
    case 'failed':
    case 'rejected':
      return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Failed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const ZelleHistory = () => {
  const { user } = useAuth();
  const [txs, setTxs] = useState<ZelleTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<ZelleTx | null>(null);

  const fetchTxs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('transfers')
      .select('id, amount, status, description, recipient_name, recipient_account, created_at, completed_at')
      .eq('user_id', user.id)
      .eq('transfer_type', 'zelle')
      .order('created_at', { ascending: false })
      .limit(100);
    setTxs((data as ZelleTx[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTxs(); }, [fetchTxs]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel('zelle-history')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transfers', filter: `user_id=eq.${user.id}` }, fetchTxs)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, fetchTxs]);

  const filtered = useMemo(() => {
    return txs.filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const blob = `${t.recipient_name || ''} ${t.recipient_account || ''} ${t.description || ''} ${t.id}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [txs, search, statusFilter]);

  return (
    <Card className="hightech-card">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Zelle Activity
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchTxs}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9 h-10" placeholder="Search recipient, memo, or ID…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44 h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="divide-y divide-border/60 rounded-lg border border-border/60 overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No Zelle transfers yet.</div>
          ) : filtered.map(t => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className="w-full text-left p-4 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{t.recipient_name || t.recipient_account || 'Zelle Payment'}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {format(new Date(t.created_at), 'MMM d, yyyy • h:mm a')} · {t.description || 'Zelle'}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-red-600">−${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div className="mt-1">{statusBadge(t.status)}</div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Receipt className="w-5 h-5 text-primary" /> Zelle Receipt</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="text-center py-3">
                <div className="text-3xl font-bold">${Number(selected.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div className="mt-2">{statusBadge(selected.status)}</div>
              </div>
              <Separator />
              <Row label="Recipient" value={selected.recipient_name || '—'} />
              <Row label="Sent to" value={selected.recipient_account || '—'} />
              <Row label="Memo" value={selected.description || '—'} />
              <Row label="Initiated" value={format(new Date(selected.created_at), 'PPpp')} />
              <Row label="Completed" value={selected.completed_at ? format(new Date(selected.completed_at), 'PPpp') : selected.status === 'pending' ? 'Within 1 business day' : '—'} />
              <Row label="Reference" value={selected.id.slice(0, 12).toUpperCase()} mono />
              <p className="text-xs text-muted-foreground pt-2">
                First Heritage Bank of America · Zelle® payments are typically irreversible once delivered.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const Row = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div className="flex justify-between gap-4">
    <span className="text-muted-foreground">{label}</span>
    <span className={`text-right ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
  </div>
);
