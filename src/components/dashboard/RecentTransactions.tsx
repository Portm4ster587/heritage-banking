import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, isToday, isYesterday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Send, 
  Landmark, 
  FileText, 
  ChevronRight,
  Loader2
} from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
  type: 'credit' | 'debit';
  category: string;
}

export const RecentTransactions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchRecent();
  }, [user]);

  const fetchRecent = async () => {
    if (!user) return;
    try {
      const all: Transaction[] = [];

      const [transfers, deposits, withdrawals, wires] = await Promise.all([
        supabase.from('transfers').select('id,amount,status,description,created_at,transfer_type,recipient_name').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('deposit_requests').select('id,amount,status,method,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('withdraw_requests').select('id,amount,status,method,destination,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('wire_transfers').select('id,amount,status,recipient_name,recipient_bank,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      ]);

      transfers.data?.forEach(t => all.push({
        id: t.id, amount: t.amount, status: t.status || 'pending',
        description: t.description || `Transfer to ${t.recipient_name || 'account'}`,
        created_at: t.created_at || new Date().toISOString(),
        type: 'debit', category: 'transfer'
      }));

      deposits.data?.forEach(d => all.push({
        id: d.id, amount: d.amount, status: d.status || 'pending',
        description: `${d.method || 'Bank'} deposit`,
        created_at: d.created_at || new Date().toISOString(),
        type: 'credit', category: 'deposit'
      }));

      withdrawals.data?.forEach(w => all.push({
        id: w.id, amount: w.amount, status: w.status || 'pending',
        description: `Withdrawal to ${w.destination || 'account'}`,
        created_at: w.created_at || new Date().toISOString(),
        type: 'debit', category: 'withdrawal'
      }));

      wires.data?.forEach(w => all.push({
        id: w.id, amount: w.amount, status: w.status || 'pending',
        description: `Wire to ${w.recipient_name}`,
        created_at: w.created_at || new Date().toISOString(),
        type: 'debit', category: 'wire'
      }));

      all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTransactions(all.slice(0, 8));
    } catch (err) {
      console.error('Error fetching recent transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transfer': return <Send className="w-4 h-4" />;
      case 'deposit': return <ArrowDownLeft className="w-4 h-4" />;
      case 'withdrawal': return <ArrowUpRight className="w-4 h-4" />;
      case 'wire': return <Landmark className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getIconBg = (category: string, type: string) => {
    if (type === 'credit') return 'bg-emerald-500/10 text-emerald-600';
    switch (category) {
      case 'wire': return 'bg-violet-500/10 text-violet-600';
      case 'withdrawal': return 'bg-rose-500/10 text-rose-600';
      default: return 'bg-primary/10 text-primary';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'pending': case 'pending_approval': return 'bg-amber-500';
      case 'rejected': return 'bg-rose-500';
      default: return 'bg-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <h3 className="text-base font-semibold text-foreground">Recent Activity</h3>
        <button 
          onClick={() => navigate('/dashboard/history')}
          className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
        >
          See all <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No recent transactions
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
          {transactions.map((txn) => (
            <div 
              key={txn.id}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate('/dashboard/history')}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(txn.category, txn.type)}`}>
                {getCategoryIcon(txn.category)}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{txn.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{formatDate(txn.created_at)}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(txn.status)}`} />
                  <span className="text-xs text-muted-foreground capitalize">{txn.status?.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-semibold ${txn.type === 'credit' ? 'text-emerald-600' : 'text-foreground'}`}>
                  {txn.type === 'credit' ? '+' : '-'}${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
