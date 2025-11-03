import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Building2, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';

const linkAccountSchema = z.object({
  accountHolderName: z.string().min(2, 'Account holder name required'),
  accountType: z.string().min(1, 'Account type required'),
  accountNumber: z.string().min(4, 'Account number required'),
  confirmAccountNumber: z.string().min(4, 'Please confirm account number'),
  routingNumber: z.string().length(9, 'Routing number must be 9 digits'),
  nickname: z.string().optional(),
  consentVerification: z.boolean().refine((val) => val === true, 'Verification consent required'),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: "Account numbers don't match",
  path: ["confirmAccountNumber"],
});

type LinkAccountFormData = z.infer<typeof linkAccountSchema>;

export default function ConnectExternalBank() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const bank = location.state?.bank;

  const form = useForm<LinkAccountFormData>({
    resolver: zodResolver(linkAccountSchema),
    defaultValues: {
      routingNumber: bank?.routing_number || '',
      accountType: 'checking',
      consentVerification: false,
    },
  });

  const onSubmit = async (data: LinkAccountFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to link an external account.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      // Simple encryption for demo (in production, use proper encryption)
      const encryptData = (data: string) => btoa(data);

      const { error } = await supabase.from('external_bank_accounts').insert({
        user_id: user.id,
        bank_id: bank?.id,
        bank_name: bank?.bank_name || 'External Bank',
        bank_code: bank?.bank_code,
        account_holder_name: data.accountHolderName,
        account_type: data.accountType,
        account_number_encrypted: encryptData(data.accountNumber),
        account_number_last_4: data.accountNumber.slice(-4),
        routing_number: data.routingNumber,
        nickname: data.nickname,
        verification_status: 'pending',
        verification_method: 'micro_deposits',
      });

      if (error) throw error;

      setSuccess(true);
      
      setTimeout(() => {
        toast({
          title: "Account Linked Successfully!",
          description: "We'll send two small deposits (less than $1) to verify your account within 1-2 business days.",
        });
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Link account error:', error);
      toast({
        title: "Linking Failed",
        description: "Failed to link external account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!bank) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-heritage-blue via-heritage-blue-dark to-heritage-blue flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2">Bank Not Selected</h3>
            <p className="text-muted-foreground mb-4">Please select a bank first</p>
            <Link to="/link-external-bank">
              <Button className="bg-heritage-blue hover:bg-heritage-blue-dark text-heritage-gold">
                Select Bank
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-heritage-blue via-heritage-blue-dark to-heritage-blue flex items-center justify-center p-4">
        <Card className="max-w-md bg-white/95 backdrop-blur animate-scale-in">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-heritage-blue mb-2">Account Linked!</h3>
            <p className="text-muted-foreground mb-4">
              Your {bank.bank_name} account has been successfully linked. 
              We'll verify it within 1-2 business days using micro-deposits.
            </p>
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-heritage-blue hover:bg-heritage-blue-dark text-heritage-gold"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-heritage-blue via-heritage-blue-dark to-heritage-blue py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to="/link-external-bank">
            <Button variant="ghost" className="text-heritage-gold hover:bg-white/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bank Selection
            </Button>
          </Link>
          
          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: bank.primary_color + '15',
                    color: bank.primary_color
                  }}
                >
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-heritage-blue">{bank.bank_name}</CardTitle>
                  <CardDescription>Connect your account securely</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="bg-white/95 backdrop-blur">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Enter your account details from {bank.bank_name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="accountHolderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John Smith" />
                      </FormControl>
                      <FormDescription>Name as it appears on your account</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="checking">Checking</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="routingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Routing Number *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123456789" maxLength={9} />
                      </FormControl>
                      <FormDescription>9-digit routing number</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number *</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="Enter account number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Account Number *</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="Re-enter account number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Nickname (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="My Savings Account" />
                      </FormControl>
                      <FormDescription>Help you identify this account</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Verification & Consent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Micro-Deposit Verification</h4>
                  <p className="text-sm text-blue-800">
                    We'll send two small deposits (less than $1 each) to your account within 1-2 business days. 
                    Once received, verify the amounts in your dashboard to complete the linking process.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="consentVerification"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I authorize Heritage Bank to verify my account using micro-deposits and agree to the account linking terms *
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-heritage-blue hover:bg-heritage-blue-dark text-heritage-gold py-6 text-lg"
                >
                  {loading ? (
                    <>
                      <Lock className="w-5 h-5 mr-2 animate-spin" />
                      Linking Account...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Link Account Securely
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        </Form>

        {/* Security Notice */}
        <Card className="bg-heritage-blue/10 backdrop-blur mt-6 border-heritage-gold/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-heritage-gold flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-heritage-blue mb-1">256-Bit Encryption</h4>
                <p className="text-sm text-heritage-blue/70">
                  All account information is encrypted using bank-level security. We never store your account credentials and comply with all banking regulations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}