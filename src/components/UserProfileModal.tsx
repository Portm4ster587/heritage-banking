import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  DollarSign,
  Calendar,
  CreditCard,
  Building,
  Edit
} from 'lucide-react';

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToSettings?: () => void;
}

export const UserProfileModal = ({ open, onOpenChange, onNavigateToSettings }: UserProfileModalProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      fetchUserData();
    }
  }, [open, user]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [profileData, accountsData, cardsData] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user?.id).maybeSingle(),
        supabase.from('accounts').select('*').eq('user_id', user?.id).eq('status', 'active'),
        supabase.from('cards').select('*').eq('user_id', user?.id)
      ]);

      setProfile(profileData.data);
      setAccounts(accountsData.data || []);
      setCards(cardsData.data || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Account Overview</DialogTitle>
          <DialogDescription>
            Complete view of your Heritage Bank account information
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Personal Information */}
            <Card className="border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-semibold text-lg">
                        {profile?.first_name} {profile?.last_name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{profile?.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {profile?.address ? (
                          <>
                            {profile.address}<br />
                            {profile.city}, {profile.state} {profile.zip_code}
                          </>
                        ) : 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Employment</p>
                      <p className="font-medium capitalize">
                        {profile?.employment_status?.replace('_', ' ') || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Annual Income</p>
                      <p className="font-medium">
                        {profile?.annual_income ? `$${profile.annual_income.toLocaleString()}` : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    onOpenChange(false);
                    onNavigateToSettings?.();
                  }}
                  variant="outline" 
                  className="w-full mt-4"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile Information
                </Button>
              </CardContent>
            </Card>

            {/* Account Summary */}
            <Card className="border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    Accounts Summary
                  </span>
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {accounts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No accounts found</p>
                  ) : (
                    accounts.map((account) => (
                      <div 
                        key={account.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold capitalize">
                              {account.account_type.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ••••{account.account_number.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                            {account.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cards */}
            <Card className="border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  My Cards ({cards.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {cards.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No cards found</p>
                  ) : (
                    cards.map((card) => (
                      <div 
                        key={card.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-4">
                          <CreditCard className="w-10 h-10 text-primary" />
                          <div>
                            <p className="font-semibold capitalize">{card.card_type} Card</p>
                            <p className="text-sm text-muted-foreground">
                              •••• •••• •••• {card.last4}
                            </p>
                          </div>
                        </div>
                        <Badge variant={card.status === 'active' ? 'default' : 'secondary'}>
                          {card.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Membership Info */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-semibold">
                        {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">
                    Heritage Business Member
                  </Badge>
                </div>
                <Separator className="my-4" />
                <p className="text-xs text-center text-muted-foreground">
                  FDIC Insured • Member FDIC
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};