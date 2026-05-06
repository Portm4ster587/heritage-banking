import { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, Check, ChevronRight, ArrowUpRight, ArrowDownLeft, TrendingUp, Sparkles, Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  routing_number: string;
  balance: number | null;
  status: string | null;
}

const formatType = (t: string) =>
  t.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

const accountIcon = (type: string) => {
  if (/saving/i.test(type)) return '💎';
  if (/business/i.test(type)) return '🏢';
  if (/invest/i.test(type)) return '📈';
  if (/loan/i.test(type)) return '🏦';
  return '💳';
};

export const ModernAccountHero = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [monthlyDelta, setMonthlyDelta] = useState({ amount: 0, percent: 0 });

  useEffect(() => {
    if (!user) return;
    fetchAll();
    const ch = supabase
      .channel('modern-hero')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'accounts', filter: `user_id=eq.${user.id}` },
        () => fetchAll()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  const fetchAll = async () => {
    try {
      const [{ data: accs }, { data: txs }] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user?.id).eq('status', 'active').order('created_at'),
        supabase.from('transfers').select('amount,created_at,transfer_type').eq('user_id', user?.id).gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
      ]);
      setAccounts(accs || []);
      const inflow = (txs || [])
        .filter((t: any) => /deposit|received|incoming/i.test(t.transfer_type))
        .reduce((s: number, t: any) => s + Number(t.amount), 0);
      const total = (accs || []).reduce((s, a) => s + Number(a.balance ?? 0), 0);
      setMonthlyDelta({ amount: inflow, percent: total > 0 ? (inflow / total) * 100 : 0 });
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    toast({ title: 'Copied', description: `${key} copied to clipboard` });
    setTimeout(() => setCopied(null), 1800);
  };

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance ?? 0), 0);
  const active = accounts[activeIdx];

  if (loading) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 h-56 flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-primary-foreground/80 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hero Balance Card — Citi/USAA inspired */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(var(--heritage-blue-dark))] via-[hsl(var(--heritage-blue))] to-[hsl(var(--heritage-blue-dark))] shadow-2xl border border-heritage-gold/15">
        {/* Decorative orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-heritage-gold/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 w-56 h-56 rounded-full bg-primary-foreground/5 blur-3xl" />
        <div className="absolute top-4 right-4 opacity-20">
          <Sparkles className="w-20 h-20 text-heritage-gold" />
        </div>

        <div className="relative p-5 sm:p-6">
          {/* Top row */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-3.5 h-3.5 text-heritage-gold" />
                <span className="text-[10px] uppercase tracking-widest text-heritage-gold/80 font-semibold">
                  Total Available
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground tracking-tight tabular-nums">
                  {showBalance
                    ? totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                    : '••••••••'}
                </h2>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-heritage-gold/70 hover:text-heritage-gold transition-colors p-1"
                >
                  {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              {monthlyDelta.amount > 0 && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-300">
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-medium">
                    +${monthlyDelta.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-primary-foreground/50">this month</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-heritage-gold/70 font-semibold">
                {accounts.length} Account{accounts.length !== 1 ? 's' : ''}
              </p>
              <p className="text-[10px] text-primary-foreground/40 mt-0.5">FDIC Insured</p>
            </div>
          </div>

          {/* Account selector chips */}
          {accounts.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide mb-4">
              {accounts.map((acc, idx) => (
                <button
                  key={acc.id}
                  onClick={() => setActiveIdx(idx)}
                  className={cn(
                    'shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-all border',
                    idx === activeIdx
                      ? 'bg-heritage-gold text-heritage-blue-dark border-heritage-gold shadow-lg'
                      : 'bg-primary-foreground/5 text-primary-foreground/80 border-primary-foreground/10 hover:border-heritage-gold/40'
                  )}
                >
                  <span className="mr-1.5">{accountIcon(acc.account_type)}</span>
                  {formatType(acc.account_type)}
                </button>
              ))}
            </div>
          )}

          {/* Active account detail card */}
          {active && (
            <div className="bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-4 border border-primary-foreground/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-heritage-gold/70 font-semibold">
                    {formatType(active.account_type)}
                  </p>
                  <p className="text-xl font-bold text-primary-foreground tabular-nums mt-0.5">
                    {showBalance
                      ? Number(active.balance ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                      : '••••••'}
                  </p>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-300 font-semibold border border-emerald-400/20">
                  ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => copy(active.account_number, 'Account')}
                  className="flex items-center justify-between bg-primary-foreground/5 hover:bg-primary-foreground/10 rounded-lg px-3 py-2 transition-colors group"
                >
                  <div className="text-left min-w-0">
                    <p className="text-[9px] uppercase text-heritage-gold/60 font-semibold">Account</p>
                    <p className="text-primary-foreground/90 font-mono truncate">
                      {showBalance ? active.account_number : `••••${active.account_number.slice(-4)}`}
                    </p>
                  </div>
                  {copied === 'Account' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-heritage-gold/60 group-hover:text-heritage-gold shrink-0" />
                  )}
                </button>
                <button
                  onClick={() => copy(active.routing_number, 'Routing')}
                  className="flex items-center justify-between bg-primary-foreground/5 hover:bg-primary-foreground/10 rounded-lg px-3 py-2 transition-colors group"
                >
                  <div className="text-left min-w-0">
                    <p className="text-[9px] uppercase text-heritage-gold/60 font-semibold">Routing</p>
                    <p className="text-primary-foreground/90 font-mono truncate">{active.routing_number}</p>
                  </div>
                  {copied === 'Routing' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-heritage-gold/60 group-hover:text-heritage-gold shrink-0" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom action row */}
        <div className="relative grid grid-cols-3 border-t border-primary-foreground/10 divide-x divide-primary-foreground/10">
          <button className="flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-heritage-gold hover:bg-primary-foreground/5 transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5" /> Send
          </button>
          <button className="flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-heritage-gold hover:bg-primary-foreground/5 transition-colors">
            <ArrowDownLeft className="w-3.5 h-3.5" /> Deposit
          </button>
          <button className="flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-heritage-gold hover:bg-primary-foreground/5 transition-colors">
            Details <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
