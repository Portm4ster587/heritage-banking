import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Mail, MessageSquare, Smartphone, Shield, DollarSign, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    low_balance_alert: true,
    low_balance_threshold: 100,
    large_transaction_alert: true,
    large_transaction_amount: 500,
    security_alerts: true,
    payment_reminders: true,
  });

  // Local UI toggles (not in DB)
  const [channels, setChannels] = useState({
    email: true,
    sms: true,
    push: true,
  });

  useEffect(() => {
    document.title = "First Heritage Bank of America - Notification Preferences";
    if (user) fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();
    
    if (data) {
      setSettings({
        low_balance_alert: data.low_balance_alert ?? true,
        low_balance_threshold: data.low_balance_threshold ?? 100,
        large_transaction_alert: data.large_transaction_alert ?? true,
        large_transaction_amount: data.large_transaction_amount ?? 500,
        security_alerts: data.security_alerts ?? true,
        payment_reminders: data.payment_reminders ?? true,
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...settings
        }, { onConflict: 'user_id' });

      if (error) throw error;
      toast({ title: "Preferences Saved", description: "Your notification settings have been updated" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save preferences", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const alertTypes = [
    { key: 'low_balance_alert', icon: DollarSign, label: 'Low Balance Alert', desc: 'Get notified when your balance drops below threshold' },
    { key: 'large_transaction_alert', icon: DollarSign, label: 'Large Transaction Alert', desc: 'Get notified for large transactions' },
    { key: 'security_alerts', icon: Shield, label: 'Security Alerts', desc: 'Login attempts, password changes, suspicious activity' },
    { key: 'payment_reminders', icon: Bell, label: 'Payment Reminders', desc: 'Upcoming bill payments and due dates' },
  ];

  const channelTypes = [
    { key: 'email', icon: Mail, label: 'Email Notifications', desc: 'Receive alerts via email' },
    { key: 'sms', icon: MessageSquare, label: 'SMS Notifications', desc: 'Receive text message alerts' },
    { key: 'push', icon: Smartphone, label: 'Push Notifications', desc: 'Browser and mobile push alerts' },
  ];

  return (
    <main className="container mx-auto px-6 py-8">
      <BackButton to="/dashboard" label="Back to Dashboard" className="mb-4" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Notification Preferences</h1>
        <p className="text-muted-foreground">Manage how and when you receive alerts</p>
      </div>

      <div className="space-y-6">
        {/* Delivery Channels */}
        <Card className="hightech-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Delivery Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {channelTypes.map(({ key, icon: Icon, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
                <Switch
                  checked={channels[key as keyof typeof channels]}
                  onCheckedChange={(v) => setChannels({ ...channels, [key]: v })}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Alert Types */}
        <Card className="hightech-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Alert Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alertTypes.map(({ key, icon: Icon, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[key as keyof typeof settings] as boolean}
                  onCheckedChange={(v) => setSettings({ ...settings, [key]: v })}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Thresholds */}
        <Card className="hightech-card">
          <CardHeader>
            <CardTitle>Alert Thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Low Balance Threshold ($)</Label>
                <Input
                  type="number"
                  value={settings.low_balance_threshold}
                  onChange={(e) => setSettings({ ...settings, low_balance_threshold: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">Alert when balance falls below this amount</p>
              </div>
              <div className="space-y-2">
                <Label>Large Transaction Amount ($)</Label>
                <Input
                  type="number"
                  value={settings.large_transaction_amount}
                  onChange={(e) => setSettings({ ...settings, large_transaction_amount: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">Alert for transactions exceeding this amount</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full banking-button">
          {saving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Save Preferences</>
          )}
        </Button>
      </div>
    </main>
  );
}
