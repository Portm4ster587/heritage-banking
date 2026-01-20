import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  CreditCard, 
  Wallet, 
  Building2, 
  Shield, 
  Eye, 
  EyeOff,
  Copy,
  ChevronRight,
  BadgeCheck,
  AlertCircle,
  Settings,
  FileText,
  Bell,
  HelpCircle,
  ArrowLeftRight,
  Bitcoin,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { CardDisplay } from "@/components/CardDisplay";
import { BackButton } from "@/components/BackButton";
import { ProfilePictureUpload } from "@/components/ProfilePictureUpload";

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
  routing_number: string;
  status: string;
}

interface CardData {
  id: string;
  card_type: string;
  card_network: string;
  last4: string;
  expiry_date: string;
  status: string;
  card_number: string;
  cvv: string;
  credit_limit?: number;
  available_credit?: number;
  spending_limit?: number;
  is_locked?: boolean;
}

interface Profile {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  date_of_birth: string | null;
  employment_status: string | null;
  employer_name: string | null;
  avatar_url: string | null;
}

interface IdVerification {
  status: string;
  verification_level: string | null;
  verified_at: string | null;
}

export default function Profile() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [verification, setVerification] = useState<IdVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAccountNumbers, setShowAccountNumbers] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});

  useEffect(() => {
    document.title = "Heritage Bank - My Profile";
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      const [accountsRes, cardsRes, profileRes, verificationRes] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user?.id),
        supabase.from('cards').select('*').eq('user_id', user?.id),
        supabase.from('profiles').select('*').eq('user_id', user?.id).maybeSingle(),
        supabase.from('id_verifications').select('status, verification_level, verified_at').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
      ]);

      setAccounts(accountsRes.data || []);
      setCards(cardsRes.data || []);
      setProfile(profileRes.data);
      setEditedProfile(profileRes.data || {});
      setVerification(verificationRes.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editedProfile.first_name,
          last_name: editedProfile.last_name,
          phone: editedProfile.phone,
          address: editedProfile.address,
          city: editedProfile.city,
          state: editedProfile.state,
          zip_code: editedProfile.zip_code
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      setProfile({ ...profile, ...editedProfile } as Profile);
      setEditMode(false);
      toast({ title: 'Profile updated', description: 'Your profile has been saved successfully' });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({ title: 'Error', description: 'Failed to save profile', variant: 'destructive' });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard` });
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  const formatAccountType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getUserInitials = () => {
    return `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}`;
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({ 
        title: "Signed out successfully", 
        description: "You have been logged out of your account." 
      });
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({ 
        title: "Error", 
        description: "Failed to sign out. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  // Quick action menu items - matching homepage ProfileMenu exactly
  const baseQuickActions = [
    { icon: User, label: 'My Profile', description: 'View complete account information', action: 'profile' },
    { icon: Settings, label: 'Account Settings', description: 'Security & preferences', path: '/dashboard/settings' },
    { icon: CreditCard, label: 'My Cards', description: 'Manage credit & debit cards', path: '/dashboard?section=cards' },
    { icon: Wallet, label: 'My Accounts', description: 'View all accounts', path: '/dashboard' },
    { icon: ArrowLeftRight, label: 'Transfers', description: 'Send & receive money', path: '/dashboard/transfers' },
    { icon: Bitcoin, label: 'Crypto', description: 'Digital assets & wallets', path: '/dashboard/crypto' },
    { icon: FileText, label: 'Statements & Documents', description: 'View account history', path: '/dashboard/history' },
    { icon: Shield, label: 'Security Center', description: 'ID verification & safety', path: '/dashboard/id-me' },
    { icon: Bell, label: 'Notification Preferences', description: 'Manage alerts', path: '/dashboard/settings' },
    { icon: HelpCircle, label: 'Help & Support', description: 'Get assistance', path: '/contact' },
    { icon: LogOut, label: 'Sign Out', description: 'Log out of your account', action: 'signout' },
  ];

  // Add Admin Panel for admin users
  const quickActions = isAdmin 
    ? [{ icon: ShieldCheck, label: 'Admin Panel', description: 'Manage system & users', path: '/admin-dashboard' }, ...baseQuickActions]
    : baseQuickActions;

  const handleQuickAction = (action: typeof quickActions[0]) => {
    if (action.action === 'profile') {
      // Scroll to profile tab
      const profileTab = document.querySelector('[value="profile"]');
      if (profileTab) {
        (profileTab as HTMLElement).click();
      }
    } else if (action.action === 'signout') {
      handleSignOut();
    } else if (action.path) {
      navigate(action.path);
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6 py-8">
      <BackButton to="/dashboard" label="Back to Dashboard" className="mb-4" />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">My Profile</h1>
        <p className="text-muted-foreground">View your accounts, cards, and personal information</p>
      </div>

      <div className="space-y-6">
        {/* Profile Header with Picture Upload */}
        <Card className="banking-card">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <ProfilePictureUpload
                currentAvatarUrl={profile?.avatar_url || undefined}
                initials={getUserInitials()}
                onUploadComplete={(url) => setProfile({ ...profile, avatar_url: url } as Profile)}
                size="lg"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold">
                  {profile?.first_name && profile?.last_name 
                    ? `${profile.first_name} ${profile.last_name}`
                    : 'Heritage Bank Member'}
                </h2>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {verification?.status === 'verified' ? (
                    <Badge className="bg-green-500">
                      <BadgeCheck className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Unverified
                    </Badge>
                  )}
                  <Badge variant="outline">Member since {new Date(user?.created_at || '').toLocaleDateString()}</Badge>
                  {isAdmin && <Badge className="bg-primary">Admin</Badge>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-3xl font-bold text-primary">${totalBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-primary/5 hover:border-primary/30"
                  onClick={() => handleQuickAction(action)}
                >
                  <action.icon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-center">{action.label}</span>
                  <span className="text-xs text-muted-foreground text-center">{action.description}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Accounts Tab - Show all accounts including $0 balance */}
          <TabsContent value="accounts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Accounts</h3>
              <Button variant="outline" size="sm" onClick={() => setShowAccountNumbers(!showAccountNumbers)}>
                {showAccountNumbers ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showAccountNumbers ? 'Hide' : 'Show'} Numbers
              </Button>
            </div>

            {accounts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No accounts found</p>
                  <Button className="mt-4" onClick={() => navigate('/open-account')}>
                    Open New Account
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {accounts.map((account) => (
                  <Card key={account.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-primary/10">
                            <Wallet className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{formatAccountType(account.account_type)}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>
                                {showAccountNumbers 
                                  ? account.account_number 
                                  : `****${account.account_number.slice(-4)}`}
                              </span>
                              {showAccountNumbers && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => copyToClipboard(account.account_number, 'Account number')}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                            {showAccountNumbers && (
                              <p className="text-xs text-muted-foreground">
                                Routing: {account.routing_number}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-5 w-5 p-0 ml-1"
                                  onClick={() => copyToClipboard(account.routing_number, 'Routing number')}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${(account.balance || 0).toLocaleString()}</p>
                          <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                            {account.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Cards ({cards.length})</h3>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard?section=cards')}>
                Manage Cards
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {cards.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No cards found</p>
                  <Button className="mt-4">Request a Card</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {cards.map((card) => (
                  <CardDisplay key={card.id} card={card} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab with Edit */}
          <TabsContent value="profile" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <Button variant="outline" size="sm" onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                {editMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        value={editedProfile.first_name || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, first_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={editedProfile.last_name || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, last_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={editedProfile.phone || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input
                        value={editedProfile.address || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={editedProfile.city || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        value={editedProfile.state || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, state: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ZIP Code</Label>
                      <Input
                        value={editedProfile.zip_code || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, zip_code: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button onClick={handleSaveProfile} className="w-full">Save Changes</Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{profile?.first_name} {profile?.last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{profile?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{profile?.date_of_birth || 'Not provided'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {profile?.address 
                          ? `${profile.address}, ${profile.city}, ${profile.state} ${profile.zip_code}`
                          : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Employment Status</p>
                      <p className="font-medium">{profile?.employment_status?.replace('_', ' ') || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Employer</p>
                      <p className="font-medium">{profile?.employer_name || 'Not provided'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <h3 className="text-lg font-semibold">Security & Verification</h3>

            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${verification?.status === 'verified' ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
                      <Shield className={`w-6 h-6 ${verification?.status === 'verified' ? 'text-green-500' : 'text-amber-500'}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold">Identity Verification</h4>
                      <p className="text-sm text-muted-foreground">
                        {verification?.status === 'verified' 
                          ? `Verified on ${new Date(verification.verified_at || '').toLocaleDateString()}`
                          : 'Complete ID verification for full access'}
                      </p>
                    </div>
                  </div>
                  {verification?.status === 'verified' ? (
                    <Badge className="bg-green-500">Verified</Badge>
                  ) : (
                    <Button onClick={() => navigate('/dashboard/id-me')}>
                      Verify Now
                    </Button>
                  )}
                </div>

                <div className="border-t pt-6 space-y-4">
                  <Button variant="outline" className="w-full justify-between" onClick={() => navigate('/dashboard/settings')}>
                    <span className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Account Settings
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  {isAdmin && (
                    <Button variant="outline" className="w-full justify-between border-primary/30" onClick={() => navigate('/admin/dashboard')}>
                      <span className="flex items-center gap-2 text-primary">
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
