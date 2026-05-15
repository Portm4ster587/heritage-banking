import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { AdminTACSystem } from './AdminTACSystem';
import { Pause, Play, Snowflake, Ban, Loader2 } from 'lucide-react';

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

type ActionKey = 'on_hold' | 'frozen' | 'suspended' | 'active';

const ACTION_META: Record<ActionKey, { label: string; verb: string; needsReason: boolean }> = {
  on_hold:   { label: 'Placed On Hold', verb: 'place on hold', needsReason: true },
  frozen:    { label: 'Frozen',         verb: 'freeze',        needsReason: true },
  suspended: { label: 'Suspended',      verb: 'suspend',       needsReason: true },
  active:    { label: 'Reactivated',    verb: 'reactivate',    needsReason: false },
};

const DEFAULT_CONTACT = 'Support: 1-800-HERITAGE • support@firstheritageboa.com';

export const AdminAccountActions = ({ account, userPhone, userEmail, onRefresh }: AdminAccountActionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingAction, setPendingAction] = useState<ActionKey | null>(null);
  const [reason, setReason] = useState('');
  const [contact, setContact] = useState(DEFAULT_CONTACT);
  const [processing, setProcessing] = useState(false);

  const open = (action: ActionKey) => {
    setPendingAction(action);
    setReason('');
    setContact(DEFAULT_CONTACT);
  };

  const submit = async () => {
    if (!pendingAction) return;
    const meta = ACTION_META[pendingAction];
    if (meta.needsReason && reason.trim().length < 4) {
      toast({ title: 'Reason required', description: 'Please provide a reason (min 4 chars).', variant: 'destructive' });
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('accounts')
        .update({
          status: pendingAction,
          status_reason: meta.needsReason ? reason.trim() : null,
          support_contact: meta.needsReason ? contact.trim() : null,
          status_changed_at: new Date().toISOString(),
          status_changed_by: user?.id ?? null,
        })
        .eq('id', account.id);
      if (error) throw error;

      const last4 = account.account_number.slice(-4);
      const inAppMsg = meta.needsReason
        ? `Your account ending in ${last4} has been ${meta.label.toLowerCase()}. Reason: ${reason.trim()}. ${contact.trim()}`
        : `Your account ending in ${last4} has been ${meta.label.toLowerCase()}.`;

      await supabase.from('user_notifications').insert({
        user_id: account.user_id,
        type: 'security',
        title: `Account ${meta.label}`,
        message: inAppMsg,
        priority: 'high',
      });

      // SMS
      if (userPhone) {
        supabase.functions.invoke('send-sms-notification', {
          body: {
            to: userPhone,
            message: `First Heritage Bank of America: Account ...${last4} ${meta.label.toLowerCase()}.${meta.needsReason ? ` Reason: ${reason.trim()}.` : ''} ${contact.trim()}`,
            type: 'security',
          },
        }).catch(() => {});
      }
      // Email
      if (userEmail) {
        supabase.functions.invoke('send-notification-email', {
          body: {
            to: userEmail,
            subject: `First Heritage Bank of America - Account ${meta.label}`,
            type: 'security',
            data: { last4, status: pendingAction, reason: reason.trim(), contact: contact.trim() },
          },
        }).catch(() => {});
      }

      toast({ title: `Account ${meta.label}`, description: `Account ...${last4} updated.` });
      setPendingAction(null);
      onRefresh();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Action failed', description: e.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const isInactive = ['on_hold', 'frozen', 'suspended'].includes(account.status);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {account.status === 'active' && (
          <>
            <Button size="sm" variant="outline" onClick={() => open('on_hold')}
              className="border-yellow-500 text-yellow-700 hover:bg-yellow-50">
              <Pause className="w-3 h-3 mr-1" /> Hold
            </Button>
            <Button size="sm" variant="outline" onClick={() => open('frozen')}
              className="border-blue-500 text-blue-700 hover:bg-blue-50">
              <Snowflake className="w-3 h-3 mr-1" /> Freeze
            </Button>
            <Button size="sm" variant="destructive" onClick={() => open('suspended')}>
              <Ban className="w-3 h-3 mr-1" /> Suspend
            </Button>
          </>
        )}
        {isInactive && (
          <Button size="sm" onClick={() => open('active')} className="bg-green-600 hover:bg-green-700">
            <Play className="w-3 h-3 mr-1" /> Reactivate
          </Button>
        )}
      </div>

      <AdminTACSystem userId={account.user_id} userPhone={userPhone} userEmail={userEmail} />

      <Dialog open={!!pendingAction} onOpenChange={(o) => !o && setPendingAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction && ACTION_META[pendingAction].label} account ...{account.account_number.slice(-4)}
            </DialogTitle>
            <DialogDescription>
              {pendingAction && ACTION_META[pendingAction].needsReason
                ? 'The customer will see this reason and contact info in-app, by SMS, and by email.'
                : 'Reactivating restores full access. The customer will be notified.'}
            </DialogDescription>
          </DialogHeader>

          {pendingAction && ACTION_META[pendingAction].needsReason && (
            <div className="space-y-3">
              <div>
                <Label>Reason (required)</Label>
                <Textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                  placeholder="e.g. Suspicious activity detected. Verification required." />
              </div>
              <div>
                <Label>Support contact shown to customer</Label>
                <Input value={contact} onChange={e => setContact(e.target.value)} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingAction(null)} disabled={processing}>Cancel</Button>
            <Button onClick={submit} disabled={processing}
              variant={pendingAction === 'suspended' ? 'destructive' : 'default'}>
              {processing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
