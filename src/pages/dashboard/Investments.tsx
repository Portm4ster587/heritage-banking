import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BackButton } from '@/components/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wallet, Briefcase, Loader2 } from 'lucide-react';

export default function Investments() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [crypto, setCrypto] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Heritage Bank - Investments';
    const load = async () => {
      if (!user) return;
      const [a, c, ca] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user.id),
        supabase.from('crypto_wallets').select('*').eq('user_id', user.id),
        supabase.from('crypto_assets').select('*'),
      ]);
      setAccounts(a.data || []);
      setCrypto(c.data || []);
      setAssets(ca.data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const investAccounts = accounts.filter(a => /invest|saving|loan/i.test(a.account_type));
  const cashAccounts = accounts.filter(a => !/invest|saving|loan/i.test(a.account_type));
  const totalInvest = investAccounts.reduce((s, a) => s + Number(a.balance), 0);
  const totalCash = cashAccounts.reduce((s, a) => s + Number(a.balance), 0);
  const cryptoValue = crypto.reduce((s, w) => {
    const px = assets.find(a => a.symbol === w.asset_symbol)?.current_price || 0;
    return s + Number(w.balance) * Number(px);
  }, 0);
  const total = totalInvest + totalCash + cryptoValue;

  return (
    <main className="container mx-auto px-4 py-6 max-w-5xl">
      <BackButton to="/dashboard" label="Back" className="mb-4" />
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-1"><Briefcase className="w-6 h-6" /> Investments & Portfolio</h1>
      <p className="text-sm text-muted-foreground mb-6">Holdings, balances, and account performance</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total portfolio</p>
          <p className="text-2xl font-bold">${total.toLocaleString(undefined,{minimumFractionDigits:2})}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Investment accounts</p>
          <p className="text-2xl font-bold">${totalInvest.toLocaleString(undefined,{minimumFractionDigits:2})}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Crypto holdings</p>
          <p className="text-2xl font-bold">${cryptoValue.toLocaleString(undefined,{minimumFractionDigits:2})}</p>
        </CardContent></Card>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5" /> Investment Accounts</CardTitle><CardDescription>Long-term and yield-bearing accounts</CardDescription></CardHeader>
        <CardContent>
          {investAccounts.length === 0 ? <p className="text-sm text-muted-foreground">No investment accounts yet.</p> :
            <div className="divide-y">
              {investAccounts.map(a => (
                <div key={a.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">{a.account_type.replace(/_/g,' ')}</p>
                    <p className="text-xs text-muted-foreground">•••{a.account_number.slice(-4)} • Routing {a.routing_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${Number(a.balance).toLocaleString(undefined,{minimumFractionDigits:2})}</p>
                    <Badge variant="outline" className="text-xs">{a.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          }
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Crypto Holdings</CardTitle></CardHeader>
        <CardContent>
          {crypto.length === 0 ? <p className="text-sm text-muted-foreground">No crypto wallets.</p> :
            <div className="divide-y">
              {crypto.map(w => {
                const asset = assets.find(a => a.symbol === w.asset_symbol);
                const price = asset?.current_price || 0;
                const value = Number(w.balance) * Number(price);
                const change = Number(asset?.price_change_24h || 0);
                return (
                  <div key={w.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{w.asset_symbol} {asset?.name && <span className="text-xs text-muted-foreground">({asset.name})</span>}</p>
                      <p className="text-xs text-muted-foreground">{Number(w.balance).toLocaleString()} {w.asset_symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${value.toLocaleString(undefined,{minimumFractionDigits:2})}</p>
                      <p className={`text-xs flex items-center justify-end gap-1 ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {change.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </CardContent>
      </Card>
    </main>
  );
}
