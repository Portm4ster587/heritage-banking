import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Subscribe to real-time changes across all transaction tables.
 * Calls `onUpdate` whenever any relevant row is inserted or updated.
 */
export const useTransactionRealTime = (onUpdate: () => void) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const tables = [
      'transfers',
      'deposit_requests',
      'withdraw_requests',
      'wire_transfers',
      'ach_transfers',
      'check_deposits',
      'accounts',
    ];

    const channels = tables.map((table) =>
      supabase
        .channel(`rt-${table}-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table, filter: `user_id=eq.${user.id}` },
          () => onUpdate()
        )
        .subscribe()
    );

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [user, onUpdate]);
};
