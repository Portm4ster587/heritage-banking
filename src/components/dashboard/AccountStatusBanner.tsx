import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Snowflake, Pause, Ban } from 'lucide-react';

interface AccountRow {
  id: string;
  account_number: string;
  status: string;
  status_reason: string | null;
  support_contact: string | null;
  status_changed_at: string | null;
}

const META: Record<string, { title: string; icon: any; cls: string }> = {
  frozen:    { title: 'Account Frozen',    icon: Snowflake, cls: 'border-blue-500/60 bg-blue-500/10 text-blue-900 dark:text-blue-100' },
  on_hold:   { title: 'Account On Hold',   icon: Pause,     cls: 'border-yellow-500/60 bg-yellow-500/10 text-yellow-900 dark:text-yellow-100' },
  suspended: { title: 'Account Suspended', icon: Ban,       cls: 'border-rose-500/60 bg-rose-500/10 text-rose-900 dark:text-rose-100' },
};

export function AccountStatusBanner() {
  const { user } = useAuth();
  const [rows, setRows] = useState<AccountRow[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('accounts')
        .select('id, account_number, status, status_reason, support_contact, status_changed_at')
        .eq('user_id', user.id)
        .neq('status', 'active');
      setRows((data as any) || []);
    };
    load();
    const ch = supabase
      .channel(`acct-status-${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'accounts', filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  if (!rows.length) return null;

  return (
    <div className="space-y-3 mb-6">
      {rows.map(r => {
        const m = META[r.status] ?? { title: `Account ${r.status}`, icon: Ban, cls: 'border-muted' };
        const Icon = m.icon;
        return (
          <Alert key={r.id} className={m.cls}>
            <Icon className="h-5 w-5" />
            <AlertTitle className="font-bold">
              {m.title} — Account ...{r.account_number.slice(-4)}
            </AlertTitle>
            <AlertDescription className="space-y-1 mt-1">
              {r.status_reason && <div><strong>Reason:</strong> {r.status_reason}</div>}
              {r.support_contact && <div><strong>Contact:</strong> {r.support_contact}</div>}
              <div className="text-xs opacity-80">
                Transfers, withdrawals, and card activity are blocked until reactivated by First Heritage Bank of America.
              </div>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
