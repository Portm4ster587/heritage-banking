import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Listen for deposit approvals
    const depositsChannel = supabase
      .channel('user-deposit-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deposit_requests',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newStatus = payload.new.status;
          const amount = payload.new.amount;
          
          if (newStatus === 'completed') {
            toast({
              title: "💰 Deposit Approved!",
              description: `Your deposit of $${amount.toLocaleString()} has been approved and credited to your account.`,
              duration: 8000
            });
          } else if (newStatus === 'rejected') {
            toast({
              title: "❌ Deposit Rejected",
              description: `Your deposit of $${amount.toLocaleString()} was rejected. Please check your notifications for details.`,
              variant: "destructive",
              duration: 8000
            });
          }
        }
      )
      .subscribe();

    // Listen for wire transfer updates
    const wireChannel = supabase
      .channel('user-wire-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'wire_transfers',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newStatus = payload.new.status;
          const amount = payload.new.amount;
          const recipientName = payload.new.recipient_name;
          
          if (newStatus === 'completed') {
            toast({
              title: "✅ Wire Transfer Completed!",
              description: `Your wire transfer of $${amount.toLocaleString()} to ${recipientName} has been processed.`,
              duration: 8000
            });
          } else if (newStatus === 'rejected') {
            toast({
              title: "❌ Wire Transfer Rejected",
              description: `Your wire transfer of $${amount.toLocaleString()} was rejected.`,
              variant: "destructive",
              duration: 8000
            });
          }
        }
      )
      .subscribe();

    // Listen for ACH transfer updates
    const achChannel = supabase
      .channel('user-ach-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ach_transfers',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newStatus = payload.new.status;
          const amount = payload.new.amount;
          
          if (newStatus === 'completed') {
            toast({
              title: "✅ ACH Transfer Completed!",
              description: `Your ACH transfer of $${amount.toLocaleString()} has been processed.`,
              duration: 8000
            });
          } else if (newStatus === 'rejected') {
            toast({
              title: "❌ ACH Transfer Rejected",
              description: `Your ACH transfer of $${amount.toLocaleString()} was rejected.`,
              variant: "destructive",
              duration: 8000
            });
          }
        }
      )
      .subscribe();

    // Listen for check deposit updates
    const checkChannel = supabase
      .channel('user-check-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'check_deposits',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newStatus = payload.new.status;
          const amount = payload.new.amount;
          
          if (newStatus === 'completed') {
            toast({
              title: "✅ Check Deposit Approved!",
              description: `Your check deposit of $${amount.toLocaleString()} has been approved.`,
              duration: 8000
            });
          } else if (newStatus === 'rejected') {
            toast({
              title: "❌ Check Deposit Rejected",
              description: `Your check deposit was rejected. Please check your notifications.`,
              variant: "destructive",
              duration: 8000
            });
          }
        }
      )
      .subscribe();

    // Listen for user notifications
    const userNotificationsChannel = supabase
      .channel('user-notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const notification = payload.new;
          toast({
            title: notification.title,
            description: notification.message,
            duration: 6000
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(depositsChannel);
      supabase.removeChannel(wireChannel);
      supabase.removeChannel(achChannel);
      supabase.removeChannel(checkChannel);
      supabase.removeChannel(userNotificationsChannel);
    };
  }, [user, toast]);
};