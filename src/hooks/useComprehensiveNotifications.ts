import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

/**
 * Comprehensive notification system that triggers SMS, email, and push (toast + audio)
 * for all transaction types in real-time.
 */
export const useComprehensiveNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const userPhoneRef = useRef<string | null>(null);
  const userEmailRef = useRef<string | null>(null);

  const playSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.value = 0.1;
      osc.start();
      setTimeout(() => osc.stop(), 200);
    } catch {}
  }, []);

  const sendSms = useCallback(async (message: string) => {
    const phone = userPhoneRef.current;
    if (!phone) return;
    try {
      await supabase.functions.invoke('send-sms-notification', {
        body: { to: phone, message, type: 'transaction' }
      });
    } catch (e) {
      console.log('SMS failed:', e);
    }
  }, []);

  const sendEmail = useCallback(async (subject: string, type: string, data: Record<string, any>) => {
    const email = userEmailRef.current;
    if (!email) return;
    try {
      await supabase.functions.invoke('send-notification-email', {
        body: { to: email, subject, type, data }
      });
    } catch (e) {
      console.log('Email failed:', e);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    // Fetch user contact info
    (async () => {
      const [{ data: profile }, { data: { user: authUser } }] = await Promise.all([
        supabase.from('profiles').select('phone').eq('user_id', user.id).maybeSingle(),
        supabase.auth.getUser()
      ]);
      userPhoneRef.current = profile?.phone || null;
      userEmailRef.current = authUser?.email || null;
    })();

    const channels: ReturnType<typeof supabase.channel>[] = [];

    // Wire transfers
    channels.push(
      supabase.channel('notif-wire')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wire_transfers', filter: `user_id=eq.${user.id}` },
          (p) => {
            const s = p.new.status; const amt = p.new.amount; const name = p.new.recipient_name;
            if (s === 'completed' || s === 'rejected') {
              playSound();
              toast({ title: s === 'completed' ? '🌐 Wire Transfer Approved!' : '❌ Wire Transfer Rejected', description: `$${amt?.toLocaleString()} to ${name}`, duration: 10000, variant: s === 'rejected' ? 'destructive' : 'default' });
              sendSms(`First Heritage Bank of America: Wire transfer of $${amt?.toLocaleString()} to ${name} ${s}. Ref: ${p.new.reference_number || p.new.id.slice(0,8)}`);
              sendEmail(`Wire Transfer ${s === 'completed' ? 'Completed' : 'Rejected'}`, 'wire', { amount: amt, recipientName: name, status: s, transactionId: p.new.reference_number });
            }
          }).subscribe()
    );

    // ACH transfers
    channels.push(
      supabase.channel('notif-ach')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ach_transfers', filter: `user_id=eq.${user.id}` },
          (p) => {
            const s = p.new.status; const amt = p.new.amount;
            if (s === 'completed' || s === 'rejected') {
              playSound();
              toast({ title: s === 'completed' ? '✅ ACH Transfer Completed!' : '❌ ACH Transfer Rejected', description: `$${amt?.toLocaleString()}`, duration: 8000, variant: s === 'rejected' ? 'destructive' : 'default' });
              sendSms(`First Heritage Bank of America: ACH transfer of $${amt?.toLocaleString()} ${s}.`);
              sendEmail(`ACH Transfer ${s}`, 'ach', { amount: amt, status: s, transactionId: p.new.reference_number });
            }
          }).subscribe()
    );

    // Deposits
    channels.push(
      supabase.channel('notif-deposit')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'deposit_requests', filter: `user_id=eq.${user.id}` },
          (p) => {
            const s = p.new.status; const amt = p.new.amount;
            if (s === 'completed' || s === 'rejected') {
              playSound();
              toast({ title: s === 'completed' ? '💰 Deposit Approved!' : '❌ Deposit Rejected', description: `$${amt?.toLocaleString()}`, duration: 10000, variant: s === 'rejected' ? 'destructive' : 'default' });
              sendSms(`First Heritage Bank of America: Your deposit of $${amt?.toLocaleString()} has been ${s}.`);
              sendEmail(`Deposit ${s}`, 'deposit', { amount: amt, status: s, transactionId: p.new.reference_number });
            }
          }).subscribe()
    );

    // Balance changes
    channels.push(
      supabase.channel('notif-balance')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'accounts', filter: `user_id=eq.${user.id}` },
          (p) => {
            const oldBal = p.old?.balance || 0;
            const newBal = p.new.balance || 0;
            const diff = newBal - oldBal;
            if (Math.abs(diff) > 0.01) {
              playSound();
              const isCredit = diff > 0;
              toast({
                title: isCredit ? '💵 Account Credited' : '📤 Account Debited',
                description: `${isCredit ? '+' : '-'}$${Math.abs(diff).toLocaleString()} · Balance: $${newBal.toLocaleString()}`,
                duration: 8000
              });
            }
          }).subscribe()
    );

    // Cards
    channels.push(
      supabase.channel('notif-card')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cards', filter: `user_id=eq.${user.id}` },
          (p) => {
            playSound();
            toast({ title: '💳 New Card Issued!', description: `${p.new.card_type} ending in ${p.new.last4}`, duration: 10000 });
            sendSms(`First Heritage Bank of America: Your new ${p.new.card_type} card ending in ${p.new.last4} has been issued.`);
            sendEmail('New Card Issued', 'alert', { message: `Your ${p.new.card_type} card ending in ${p.new.last4} is ready.` });
          }).subscribe()
    );

    // Withdrawals
    channels.push(
      supabase.channel('notif-withdraw')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'withdraw_requests', filter: `user_id=eq.${user.id}` },
          (p) => {
            const s = p.new.status; const amt = p.new.amount;
            if (s === 'completed' || s === 'rejected') {
              playSound();
              toast({ title: s === 'completed' ? '✅ Withdrawal Processed!' : '❌ Withdrawal Rejected', description: `$${amt?.toLocaleString()}`, duration: 8000, variant: s === 'rejected' ? 'destructive' : 'default' });
              sendSms(`First Heritage Bank of America: Your withdrawal of $${amt?.toLocaleString()} has been ${s}.`);
              sendEmail(`Withdrawal ${s}`, 'withdrawal', { amount: amt, status: s });
            }
          }).subscribe()
    );

    // Check deposits
    channels.push(
      supabase.channel('notif-check')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'check_deposits', filter: `user_id=eq.${user.id}` },
          (p) => {
            const s = p.new.status; const amt = p.new.amount;
            if (s === 'completed' || s === 'rejected') {
              playSound();
              toast({ title: s === 'completed' ? '✅ Check Deposit Approved!' : '❌ Check Deposit Rejected', description: `$${amt?.toLocaleString()}`, duration: 8000, variant: s === 'rejected' ? 'destructive' : 'default' });
              sendSms(`First Heritage Bank of America: Your check deposit of $${amt?.toLocaleString()} has been ${s}.`);
              sendEmail(`Check Deposit ${s}`, 'deposit', { amount: amt, status: s });
            }
          }).subscribe()
    );

    // Support messages
    channels.push(
      supabase.channel('notif-support')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' },
          async (p) => {
            const { data: conv } = await supabase.from('support_conversations').select('user_id').eq('id', p.new.conversation_id).single();
            if (conv?.user_id === user.id && p.new.sender_type === 'admin') {
              playSound();
              toast({ title: '💬 New Support Message', description: 'You have a new message from First Heritage Bank of America support.', duration: 8000 });
            }
          }).subscribe()
    );

    // User notifications
    channels.push(
      supabase.channel('notif-user')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_notifications', filter: `user_id=eq.${user.id}` },
          (p) => {
            playSound();
            toast({ title: p.new.title, description: p.new.message, variant: p.new.priority === 'high' ? 'destructive' : 'default', duration: 8000 });
          }).subscribe()
    );

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [user, toast, playSound, sendSms, sendEmail]);
};
