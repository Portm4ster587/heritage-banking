import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useEnhancedRealTimeNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 200);
    } catch (error) {
      console.log('Audio notification not available');
    }
  };

  useEffect(() => {
    if (!user) return;

    const channels: ReturnType<typeof supabase.channel>[] = [];

    // Wire transfer approvals/rejections
    const wireChannel = supabase
      .channel('enhanced-wire-notifications')
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
          
          playNotificationSound();
          
          if (newStatus === 'completed') {
            toast({
              title: "🎉 Wire Transfer Approved!",
              description: `Your wire transfer of $${amount.toLocaleString()} to ${recipientName} has been approved and processed.`,
              duration: 10000
            });
          } else if (newStatus === 'rejected') {
            toast({
              title: "❌ Wire Transfer Rejected",
              description: `Your wire transfer of $${amount.toLocaleString()} to ${recipientName} was rejected. Please contact support.`,
              variant: "destructive",
              duration: 10000
            });
          }
        }
      )
      .subscribe();
    channels.push(wireChannel);

    // ACH transfer updates
    const achChannel = supabase
      .channel('enhanced-ach-notifications')
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
          
          playNotificationSound();
          
          if (newStatus === 'completed') {
            toast({
              title: "✅ ACH Transfer Completed!",
              description: `Your ACH transfer of $${amount.toLocaleString()} has been processed successfully.`,
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
    channels.push(achChannel);

    // Deposit approvals
    const depositChannel = supabase
      .channel('enhanced-deposit-notifications')
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
          
          playNotificationSound();
          
          if (newStatus === 'completed') {
            toast({
              title: "💰 Deposit Approved!",
              description: `Your deposit of $${amount.toLocaleString()} has been approved and credited.`,
              duration: 10000
            });
          } else if (newStatus === 'rejected') {
            toast({
              title: "❌ Deposit Rejected",
              description: `Your deposit request for $${amount.toLocaleString()} was rejected.`,
              variant: "destructive",
              duration: 10000
            });
          }
        }
      )
      .subscribe();
    channels.push(depositChannel);

    // Balance changes (account updates)
    const balanceChannel = supabase
      .channel('enhanced-balance-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'accounts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const oldBalance = payload.old.balance || 0;
          const newBalance = payload.new.balance || 0;
          const difference = newBalance - oldBalance;
          
          if (Math.abs(difference) > 0.01) {
            playNotificationSound();
            
            if (difference > 0) {
              toast({
                title: "💵 Account Credited",
                description: `$${difference.toLocaleString()} has been added to your account. New balance: $${newBalance.toLocaleString()}`,
                duration: 8000
              });
            } else {
              toast({
                title: "📤 Account Debited",
                description: `$${Math.abs(difference).toLocaleString()} was debited. New balance: $${newBalance.toLocaleString()}`,
                duration: 8000
              });
            }
          }
        }
      )
      .subscribe();
    channels.push(balanceChannel);

    // Card issuance notifications
    const cardChannel = supabase
      .channel('enhanced-card-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cards',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const cardType = payload.new.card_type;
          const last4 = payload.new.last4;
          
          playNotificationSound();
          
          toast({
            title: "💳 New Card Issued!",
            description: `Your ${cardType} card ending in ${last4} has been issued and is ready to use.`,
            duration: 10000
          });
        }
      )
      .subscribe();
    channels.push(cardChannel);

    // Check deposit updates
    const checkChannel = supabase
      .channel('enhanced-check-notifications')
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
          
          playNotificationSound();
          
          if (newStatus === 'completed') {
            toast({
              title: "✅ Check Deposit Approved!",
              description: `Your check deposit of $${amount.toLocaleString()} has been approved.`,
              duration: 8000
            });
          } else if (newStatus === 'rejected') {
            toast({
              title: "❌ Check Deposit Rejected",
              description: `Your check deposit was rejected. Please contact support.`,
              variant: "destructive",
              duration: 8000
            });
          }
        }
      )
      .subscribe();
    channels.push(checkChannel);

    // Withdrawal updates
    const withdrawChannel = supabase
      .channel('enhanced-withdraw-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'withdraw_requests',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newStatus = payload.new.status;
          const amount = payload.new.amount;
          
          playNotificationSound();
          
          if (newStatus === 'completed') {
            toast({
              title: "✅ Withdrawal Processed!",
              description: `Your withdrawal of $${amount.toLocaleString()} has been processed.`,
              duration: 8000
            });
          } else if (newStatus === 'rejected') {
            toast({
              title: "❌ Withdrawal Rejected",
              description: `Your withdrawal request was rejected.`,
              variant: "destructive",
              duration: 8000
            });
          }
        }
      )
      .subscribe();
    channels.push(withdrawChannel);

    // Support message notifications
    const supportChannel = supabase
      .channel('enhanced-support-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages'
        },
        async (payload) => {
          // Check if message is for a conversation belonging to this user
          const { data: conv } = await supabase
            .from('support_conversations')
            .select('user_id')
            .eq('id', payload.new.conversation_id)
            .single();
          
          if (conv?.user_id === user.id && payload.new.sender_type === 'admin') {
            playNotificationSound();
            
            toast({
              title: "💬 New Support Message",
              description: "You have a new message from First Heritage Bank of America support.",
              duration: 8000
            });
          }
        }
      )
      .subscribe();
    channels.push(supportChannel);

    // User notifications table
    const userNotifChannel = supabase
      .channel('enhanced-user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          playNotificationSound();
          
          toast({
            title: payload.new.title,
            description: payload.new.message,
            variant: payload.new.priority === 'high' ? 'destructive' : 'default',
            duration: 8000
          });
        }
      )
      .subscribe();
    channels.push(userNotifChannel);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, toast]);
};
