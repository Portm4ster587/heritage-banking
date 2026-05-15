import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AdminTACSystem } from './AdminTACSystem';
import { 
  Pause, 
  Play, 
  Snowflake, 
  Ban, 
  CheckCircle,
  ShieldAlert
} from 'lucide-react';

interface AdminAccountActionsProps {
  account: {
    id: string;
    user_id: string;
    status: string;
    account_number: string;
  };
  userPhone?: string;
  userEmail?: string;
  onRefresh: () => void;
}

export const AdminAccountActions = ({ account, userPhone, userEmail, onRefresh }: AdminAccountActionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const updateStatus = async (newStatus: string, label: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ status: newStatus })
        .eq('id', account.id);

      if (error) throw error;

      // Notify user
      await supabase.from('user_notifications').insert({
        user_id: account.user_id,
        type: 'security',
        title: `Account ${label}`,
        message: `Your account ending in ${account.account_number.slice(-4)} has been ${label.toLowerCase()}.`,
        priority: 'high'
      });

      // Send SMS notification
      if (userPhone) {
        await supabase.functions.invoke('send-sms-notification', {
          body: {
            to: userPhone,
            message: `First Heritage Bank of America: Your account ending in ${account.account_number.slice(-4)} has been ${label.toLowerCase()}. Contact support if you did not request this.`,
            type: 'security'
          }
        });
      }

      toast({ title: `Account ${label}`, description: `Account ${account.account_number.slice(-4)} is now ${newStatus}` });
      onRefresh();
    } catch (error) {
      console.error('Error updating account:', error);
      toast({ title: "Error", description: `Failed to ${label.toLowerCase()} account`, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {account.status === 'active' && (
          <>
            <Button size="sm" variant="outline" onClick={() => updateStatus('on_hold', 'Placed On Hold')} disabled={processing}
              className="border-yellow-500 text-yellow-700 hover:bg-yellow-50">
              <Pause className="w-3 h-3 mr-1" /> Hold
            </Button>
            <Button size="sm" variant="outline" onClick={() => updateStatus('frozen', 'Frozen')} disabled={processing}
              className="border-blue-500 text-blue-700 hover:bg-blue-50">
              <Snowflake className="w-3 h-3 mr-1" /> Freeze
            </Button>
            <Button size="sm" variant="destructive" onClick={() => updateStatus('suspended', 'Suspended')} disabled={processing}>
              <Ban className="w-3 h-3 mr-1" /> Suspend
            </Button>
          </>
        )}
        {(account.status === 'on_hold' || account.status === 'frozen' || account.status === 'suspended') && (
          <Button size="sm" onClick={() => updateStatus('active', 'Activated')} disabled={processing}
            className="bg-green-600 hover:bg-green-700">
            <Play className="w-3 h-3 mr-1" /> Activate
          </Button>
        )}
      </div>
      
      {/* TAC System */}
      <AdminTACSystem 
        userId={account.user_id}
        userPhone={userPhone}
        userEmail={userEmail}
      />
    </div>
  );
};
