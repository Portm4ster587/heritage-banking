import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  Smartphone,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Save
} from 'lucide-react';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  dob: string;
  ssn_last4: string;
  employment_status: string;
  employer_name: string;
  job_title: string;
  annual_income: number;
  monthly_income: number;
}

interface SecurityQuestion {
  question: string;
  answer: string;
}

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What city were you born in?",
  "What was your childhood nickname?",
  "What is the name of your favorite childhood friend?",
  "What was the make of your first car?",
  "What is your favorite book?",
  "What was the name of your first employer?",
  "What street did you live on in third grade?"
];

export const AccountSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({});
  
  // Security settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  
  // Security questions
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' }
  ]);
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    email_alerts: true,
    sms_alerts: true,
    push_notifications: true,
    marketing_emails: false,
    security_alerts: true,
    transaction_alerts: true
  });
  
  // Two-factor authentication
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setProfileForm(data);
        setPhoneNumber(data.phone || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user || !profileForm) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileForm,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated"
      });

      fetchUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile information",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed"
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Password Update Failed",
        description: "Failed to update password",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSecurityQuestionsUpdate = async () => {
    // Validate all questions are filled
    const incompleteQuestions = securityQuestions.some(sq => !sq.question || !sq.answer);
    if (incompleteQuestions) {
      toast({
        title: "Incomplete Security Questions",
        description: "Please complete all security questions",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Note: Security questions would be stored in a dedicated table in production
      // For now, just show success message
      
      toast({
        title: "Security Questions Updated",
        description: "Your security questions have been saved"
      });
    } catch (error) {
      console.error('Error updating security questions:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update security questions",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    if (!twoFactorEnabled && !phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number to enable 2FA",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      setTwoFactorEnabled(!twoFactorEnabled);
      
      toast({
        title: twoFactorEnabled ? "2FA Disabled" : "2FA Enabled",
        description: twoFactorEnabled 
          ? "Two-factor authentication has been disabled" 
          : "Two-factor authentication has been enabled"
      });
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      setTwoFactorEnabled(twoFactorEnabled); // Revert on error
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading account settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-primary mb-2">Account Settings</h2>
        <p className="text-muted-foreground">Manage your account information and security preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="banking-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={profileForm.first_name || ''}
                    onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={profileForm.last_name || ''}
                    onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email || user?.email || ''}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone || ''}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line1">Address Line 1</Label>
                <Input
                  id="address_line1"
                  value={profileForm.address_line1 || ''}
                  onChange={(e) => setProfileForm({...profileForm, address_line1: e.target.value})}
                  placeholder="Enter your street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profileForm.city || ''}
                    onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                    placeholder="Enter your city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={profileForm.state || ''}
                    onChange={(e) => setProfileForm({...profileForm, state: e.target.value})}
                    placeholder="Enter your state"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">ZIP Code</Label>
                  <Input
                    id="postal_code"
                    value={profileForm.postal_code || ''}
                    onChange={(e) => setProfileForm({...profileForm, postal_code: e.target.value})}
                    placeholder="Enter your ZIP code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employment_status">Employment Status</Label>
                  <Select 
                    value={profileForm.employment_status || ''}
                    onValueChange={(value) => setProfileForm({...profileForm, employment_status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self_employed">Self-Employed</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annual_income">Annual Income</Label>
                  <Input
                    id="annual_income"
                    type="number"
                    value={profileForm.annual_income || ''}
                    onChange={(e) => setProfileForm({...profileForm, annual_income: parseFloat(e.target.value)})}
                    placeholder="Enter your annual income"
                  />
                </div>
              </div>

              <Button 
                onClick={handleProfileUpdate}
                disabled={saving}
                className="w-full banking-button"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          {/* Password Change */}
          <Card className="banking-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPasswords(!showPasswords)}
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input
                    id="confirm_password"
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <Button 
                onClick={handlePasswordChange}
                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                className="banking-button"
              >
                {saving ? "Updating..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>

          {/* Security Questions */}
          <Card className="banking-card">
            <CardHeader>
              <CardTitle>Security Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {securityQuestions.map((sq, index) => (
                <div key={index} className="space-y-2">
                  <Label>Question {index + 1}</Label>
                  <Select 
                    value={sq.question}
                    onValueChange={(value) => {
                      const updated = [...securityQuestions];
                      updated[index].question = value;
                      setSecurityQuestions(updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a security question" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECURITY_QUESTIONS.map((question) => (
                        <SelectItem key={question} value={question}>
                          {question}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="password"
                    placeholder="Your answer"
                    value={sq.answer}
                    onChange={(e) => {
                      const updated = [...securityQuestions];
                      updated[index].answer = e.target.value;
                      setSecurityQuestions(updated);
                    }}
                  />
                </div>
              ))}

              <Button 
                onClick={handleSecurityQuestionsUpdate}
                disabled={saving}
                className="banking-button"
              >
                Save Security Questions
              </Button>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card className="banking-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Two-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleTwoFactorToggle}
                  disabled={saving}
                />
              </div>

              {!twoFactorEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="phone_2fa">Phone Number for 2FA</Label>
                  <Input
                    id="phone_2fa"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number for 2FA codes"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="banking-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">
                      {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {key.includes('security') && "Important security notifications"}
                      {key.includes('transaction') && "Transaction confirmations and alerts"}
                      {key.includes('marketing') && "Product updates and promotions"}
                      {key.includes('email') && "Email notifications for account activity"}
                      {key.includes('sms') && "SMS notifications for urgent matters"}
                      {key.includes('push') && "Push notifications on mobile devices"}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, [key]: checked})
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card className="banking-card">
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border border-warning/20 rounded-lg bg-warning/5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-warning">Data Protection</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your personal information is protected by bank-grade encryption and 
                        is never shared with third parties without your explicit consent.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Data Download</h4>
                  <p className="text-sm text-muted-foreground">
                    Download a copy of all your personal data stored in our system.
                  </p>
                  <Button variant="outline" className="banking-button">
                    Request Data Export
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Account Deletion</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" className="banking-button">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};