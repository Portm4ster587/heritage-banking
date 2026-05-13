import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BackButton } from '@/components/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PieChart as PieIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { format, startOfMonth, subMonths } from 'date-fns';

const CATEGORY_COLORS: Record<string, string> = {
  bills: '#f59e0b', food: '#10b981', shopping: '#8b5cf6',
  transport: '#3b82f6', entertainment: '#ec4899',
  transfer: '#6366f1', wire: '#a855f7', deposit: '#22c55e',
  withdrawal: '#ef4444', cross_bank: '#f97316', other: '#94a3b8'
};

function categorize(desc: string, fallback: string) {
  const d = (desc || '').toLowerCase();
  if (/grocery|food|restaurant|cafe|uber eats|doordash/.test(d)) return 'food';
  if (/electric|water|gas|internet|utility|bill|cable/.test(d)) return 'bills';
  if (/uber|lyft|fuel|gas|transit|metro/.test(d)) return 'transport';
  if (/amazon|walmart|target|store|shop/.test(d)) return 'shopping';
  if (/netflix|spotify|cinema|movie|game/.test(d)) return 'entertainment';
  return fallback;
}

export default function Budgeting() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [crossBank, setCrossBank] = useState<any[]>([]);
  const [wires, setWires] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);

  useEffect(() => {
    document.title = 'Heritage Bank - Budgeting';
    const load = async () => {
      if (!user) return;
      const since = subMonths(new Date(), 6).toISOString();
      const [t, cb, w, wd, d] = await Promise.all([
        supabase.from('transfers').select('amount,description,created_at,transfer_type,category').eq('user_id', user.id).gte('created_at', since),
        supabase.from('cross_bank_transfers').select('amount,recipient_name,created_at,status').eq('user_id', user.id).gte('created_at', since),
        supabase.from('wire_transfers').select('amount,recipient_name,created_at,status').eq('user_id', user.id).gte('created_at', since),
        supabase.from('withdraw_requests').select('amount,destination,created_at,status').eq('user_id', user.id).gte('created_at', since),
        supabase.from('deposit_requests').select('amount,method,created_at,status').eq('user_id', user.id).gte('created_at', since),
      ]);
      setTransfers(t.data || []); setCrossBank(cb.data || []); setWires(w.data || []);
      setWithdrawals(wd.data || []); setDeposits(d.data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const allDebits = useMemo(() => [
    ...transfers.map(t => ({ amount: Number(t.amount), date: t.created_at, cat: t.category || categorize(t.description, 'transfer') })),
    ...crossBank.filter(c => c.status === 'completed').map(c => ({ amount: Number(c.amount), date: c.created_at, cat: 'cross_bank' })),
    ...wires.filter(w => w.status === 'completed').map(w => ({ amount: Number(w.amount), date: w.created_at, cat: 'wire' })),
    ...withdrawals.filter(w => w.status === 'completed').map(w => ({ amount: Number(w.amount), date: w.created_at, cat: 'withdrawal' })),
  ], [transfers, crossBank, wires, withdrawals]);

  const allCredits = useMemo(() =>
    deposits.filter(d => d.status === 'completed').map(d => ({ amount: Number(d.amount), date: d.created_at })),
    [deposits]);

  const byCategory = useMemo(() => {
    const m = new Map<string, number>();
    allDebits.forEach(t => m.set(t.cat, (m.get(t.cat) || 0) + t.amount));
    return Array.from(m.entries()).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value);
  }, [allDebits]);

  const monthly = useMemo(() => {
    const m = new Map<string, { month: string; income: number; spending: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = startOfMonth(subMonths(new Date(), i));
      const k = format(d, 'MMM');
      m.set(k, { month: k, income: 0, spending: 0 });
    }
    allDebits.forEach(t => {
      const k = format(new Date(t.date), 'MMM');
      const e = m.get(k); if (e) e.spending += t.amount;
    });
    allCredits.forEach(c => {
      const k = format(new Date(c.date), 'MMM');
      const e = m.get(k); if (e) e.income += c.amount;
    });
    return Array.from(m.values());
  }, [allDebits, allCredits]);

  const totalSpending = byCategory.reduce((s, c) => s + c.value, 0);
  const totalIncome = allCredits.reduce((s, c) => s + c.amount, 0);
  const net = totalIncome - totalSpending;

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <main className="container mx-auto px-4 py-6 max-w-5xl">
      <BackButton to="/dashboard" label="Back" className="mb-4" />
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-1"><PieIcon className="w-6 h-6" /> Budgeting & Spending Insights</h1>
      <p className="text-sm text-muted-foreground mb-6">Last 6 months of your activity</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Income</p>
          <p className="text-2xl font-bold text-emerald-600">+${totalIncome.toLocaleString(undefined,{minimumFractionDigits:2})}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Spending</p>
          <p className="text-2xl font-bold text-rose-600">-${totalSpending.toLocaleString(undefined,{minimumFractionDigits:2})}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Net</p>
          <p className={`text-2xl font-bold flex items-center gap-1 ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {net >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            ${Math.abs(net).toLocaleString(undefined,{minimumFractionDigits:2})}
          </p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>By category</CardTitle><CardDescription>Where your money went</CardDescription></CardHeader>
          <CardContent>
            {byCategory.length === 0 ? <p className="text-sm text-muted-foreground">No spending yet.</p> :
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={90} label={(e) => e.name}>
                      {byCategory.map((c, i) => <Cell key={i} fill={CATEGORY_COLORS[c.name] || '#94a3b8'} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            }
            <div className="mt-3 space-y-1">
              {byCategory.map(c => (
                <div key={c.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 capitalize">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[c.name] || '#94a3b8' }} />
                    {c.name.replace('_',' ')}
                  </span>
                  <span className="font-medium">${c.value.toLocaleString(undefined,{minimumFractionDigits:2})}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Monthly trend</CardTitle><CardDescription>Income vs spending</CardDescription></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" />
                  <Bar dataKey="spending" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
