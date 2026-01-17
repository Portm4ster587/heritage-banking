import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Shield, 
  Bell, 
  DollarSign, 
  Clock, 
  Mail, 
  Globe, 
  Lock,
  Database,
  Server,
  RefreshCw
} from 'lucide-react';

export const SystemSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Transaction Limits
    dailyTransferLimit: 50000,
    singleTransferLimit: 25000,
    withdrawalLimit: 10000,
    
    // Security Settings
    requireTwoFactor: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: true,
    adminAlerts: true,
    
    // Fee Settings
    wireTransferFee: 25,
    internationalFee: 45,
    achFee: 0,
    
    // Maintenance
    maintenanceMode: false,
    debugMode: false
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully.",
    });
  };

  const handleReset = () => {
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to default values.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Transaction Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Transaction Limits
          </CardTitle>
          <CardDescription>Configure daily and per-transaction limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Daily Transfer Limit ($)</Label>
              <Input
                type="number"
                value={settings.dailyTransferLimit}
                onChange={(e) => setSettings({ ...settings, dailyTransferLimit: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Single Transfer Limit ($)</Label>
              <Input
                type="number"
                value={settings.singleTransferLimit}
                onChange={(e) => setSettings({ ...settings, singleTransferLimit: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Daily Withdrawal Limit ($)</Label>
              <Input
                type="number"
                value={settings.withdrawalLimit}
                onChange={(e) => setSettings({ ...settings, withdrawalLimit: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>Authentication and session security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Enforce 2FA for all admin accounts</p>
            </div>
            <Switch
              checked={settings.requireTwoFactor}
              onCheckedChange={(checked) => setSettings({ ...settings, requireTwoFactor: checked })}
            />
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Session Timeout (minutes)
              </Label>
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Max Login Attempts
              </Label>
              <Input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure system-wide notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">Send email alerts for transactions</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Send SMS alerts for important events</p>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Admin Alerts</Label>
              <p className="text-sm text-muted-foreground">Notify admins of high-value transactions</p>
            </div>
            <Switch
              checked={settings.adminAlerts}
              onCheckedChange={(checked) => setSettings({ ...settings, adminAlerts: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Fee Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Fee Configuration
          </CardTitle>
          <CardDescription>Set transaction fees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Wire Transfer Fee ($)</Label>
              <Input
                type="number"
                value={settings.wireTransferFee}
                onChange={(e) => setSettings({ ...settings, wireTransferFee: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>International Transfer Fee ($)</Label>
              <Input
                type="number"
                value={settings.internationalFee}
                onChange={(e) => setSettings({ ...settings, internationalFee: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>ACH Transfer Fee ($)</Label>
              <Input
                type="number"
                value={settings.achFee}
                onChange={(e) => setSettings({ ...settings, achFee: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Maintenance
          </CardTitle>
          <CardDescription>System status and maintenance options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-orange-600">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Disable user access for maintenance</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Debug Mode</Label>
              <p className="text-sm text-muted-foreground">Enable detailed logging (development only)</p>
            </div>
            <Switch
              checked={settings.debugMode}
              onCheckedChange={(checked) => setSettings({ ...settings, debugMode: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Clear Cache
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Restart Services
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} className="bg-heritage-blue hover:bg-heritage-blue/90">
          <Settings className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};
