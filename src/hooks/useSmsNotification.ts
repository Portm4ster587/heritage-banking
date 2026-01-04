import { supabase } from "@/integrations/supabase/client";

interface SmsNotificationParams {
  to: string;
  message: string;
  type?: 'transaction' | 'security' | 'alert' | 'verification';
}

export const useSmsNotification = () => {
  const sendSms = async ({ to, message, type = 'alert' }: SmsNotificationParams) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-sms-notification', {
        body: { to, message, type }
      });

      if (error) {
        console.error('SMS notification error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Failed to send SMS:', error);
      return { success: false, error: error.message };
    }
  };

  const sendTransactionAlert = async (phone: string, amount: number, type: 'credit' | 'debit', description: string) => {
    const symbol = type === 'credit' ? '+' : '-';
    const message = `Heritage Bank Alert: ${symbol}$${amount.toLocaleString()} ${description}. Reply STOP to unsubscribe.`;
    return sendSms({ to: phone, message, type: 'transaction' });
  };

  const sendSecurityAlert = async (phone: string, action: string) => {
    const message = `Heritage Bank Security: ${action}. If this wasn't you, call 1-800-HERITAGE immediately.`;
    return sendSms({ to: phone, message, type: 'security' });
  };

  const sendVerificationCode = async (phone: string, code: string) => {
    const message = `Heritage Bank: Your verification code is ${code}. Valid for 10 minutes. Do not share this code.`;
    return sendSms({ to: phone, message, type: 'verification' });
  };

  return { sendSms, sendTransactionAlert, sendSecurityAlert, sendVerificationCode };
};
