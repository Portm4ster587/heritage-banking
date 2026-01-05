import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CardDisplay } from './CardDisplay';
import { useNavigate } from 'react-router-dom';

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
}

interface IdVerification {
  status: string;
  verification_level: string | null;
  verified_at: string | null;
}

export const UserAccountProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [verification, setVerification] = useState<IdVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAccountNumbers, setShowAccountNumbers] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      const [accountsRes, cardsRes, profileRes, verificationRes] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user?.id).eq('status', 'active'),
        supabase.from('cards').select('*').eq('user_id', user?.id),
        supabase.from('profiles').select('*').eq('user_id', user?.id).maybeSingle(),
        supabase.from('id_verifications').select('status, verification_level, verified_at').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
      ]);

      setAccounts(accountsRes.data || []);
      setCards(cardsRes.data || []);
      setProfile(profileRes.data);
      setVerification(verificationRes.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="banking-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold">
              {profile?.first_name?.[0]}{profile?.last_name?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : 'Heritage Bank Member'}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
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
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-3xl font-bold text-primary">${totalBalance.toLocaleString()}</p>
            </div>
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

        {/* Accounts Tab */}
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
                        <p className="text-2xl font-bold">${account.balance.toLocaleString()}</p>
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
            <h3 className="text-lg font-semibold">Your Cards</h3>
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

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/settings')}>
              Edit Profile
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
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

              <div className="border-t pt-6">
                <Button variant="outline" className="w-full justify-between" onClick={() => navigate('/dashboard/settings')}>
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Account Settings
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
