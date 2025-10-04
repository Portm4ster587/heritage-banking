import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, CreditCard, FileText, Home, Car, Building } from 'lucide-react';

const guestApplicationSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  ssnLast4: z.string().length(4, 'SSN last 4 digits must be exactly 4 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  
  // Address Information
  addressLine1: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  postalCode: z.string().min(5, 'Postal code is required'),
  
  // Employment Information
  employmentStatus: z.string().min(1, 'Employment status is required'),
  annualIncome: z.string().min(1, 'Annual income is required'),
  
  // Application Specific
  requestedAmount: z.string().optional(),
  
  // Agreements
  terms: z.boolean().refine((val) => val === true, 'You must agree to the terms'),
  privacy: z.boolean().refine((val) => val === true, 'You must agree to the privacy policy'),
  creditCheck: z.boolean().refine((val) => val === true, 'You must consent to credit check'),
});

type GuestApplicationFormData = z.infer<typeof guestApplicationSchema>;

interface GuestApplicationFormProps {
  applicationType: 'checking' | 'savings' | 'business' | 'credit_card' | 'personal_loan' | 'home_loan' | 'auto_loan' | 'business_loan';
  onSuccess?: () => void;
}

const applicationConfig = {
  checking: {
    title: 'Personal Checking Account - Guest Application',
    description: 'Apply for a checking account without creating an account first',
    icon: User,
    color: 'bg-primary',
  },
  savings: {
    title: 'Personal Savings Account - Guest Application', 
    description: 'Start saving with our high-yield savings account',
    icon: User,
    color: 'bg-secondary',
  },
  credit_card: {
    title: 'Credit Card - Guest Application',
    description: 'Apply for a credit card with competitive rates',
    icon: CreditCard,
    color: 'bg-primary',
  },
  personal_loan: {
    title: 'Personal Loan - Guest Application',
    description: 'Get funds for personal expenses',
    icon: FileText,
    color: 'bg-secondary',
  },
  home_loan: {
    title: 'Home Loan - Guest Application',
    description: 'Finance your dream home',
    icon: Home,
    color: 'bg-accent',
  },
  auto_loan: {
    title: 'Auto Loan - Guest Application',
    description: 'Finance your next vehicle',
    icon: Car,
    color: 'bg-primary',
  },
  business: {
    title: 'Business Account - Guest Application',
    description: 'Banking solutions for your business',
    icon: Building,
    color: 'bg-accent',
  },
  business_loan: {
    title: 'Business Loan - Guest Application',
    description: 'Grow your business with financing',
    icon: Building,
    color: 'bg-secondary',
  },
};

export const GuestApplicationForm = ({ applicationType, onSuccess }: GuestApplicationFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const config = applicationConfig[applicationType];

  const form = useForm<GuestApplicationFormData>({
    resolver: zodResolver(guestApplicationSchema),
    defaultValues: {
      terms: false,
      privacy: false,
      creditCheck: false,
    },
  });

  const onSubmit = async (data: GuestApplicationFormData) => {
    setLoading(true);
    try {
      toast({
        title: "Sign in required",
        description: "Please create an account or sign in to submit an application.",
      });
      form.reset();
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  const IconComponent = config.icon;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <Card className="banking-card">
        <CardHeader className="text-center">
          <div className={`w-16 h-16 ${config.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">{config.title}</CardTitle>
          <CardDescription className="text-lg">{config.description}</CardDescription>
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mt-4">
            <p className="text-sm text-accent-foreground">
              🚀 <strong>Quick Application:</strong> No account registration required! 
              Apply now and we'll contact you within 24 hours.
            </p>
          </div>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <Card className="banking-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ssnLast4"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SSN Last 4 Digits *</FormLabel>
                      <FormControl>
                        <Input placeholder="1234" maxLength={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address & Employment */}
          <Card className="banking-card">
            <CardHeader>
              <CardTitle>Address & Employment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" maxLength={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employmentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employed">Employed</SelectItem>
                          <SelectItem value="self-employed">Self-Employed</SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annualIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Income *</FormLabel>
                      <FormControl>
                        <Input placeholder="50000" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {(applicationType.includes('loan') || applicationType === 'credit_card') && (
                <FormField
                  control={form.control}
                  name="requestedAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {applicationType === 'credit_card' ? 'Desired Credit Limit' : 'Requested Loan Amount'}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="10000" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Terms & Submission */}
          <Card className="banking-card">
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="terms"
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
                            I agree to the Terms and Conditions *
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="privacy"
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
                            I agree to the Privacy Policy *
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="creditCheck"
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
                            I consent to credit check and verification *
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-3 banking-button pulse-glow"
                disabled={loading}
              >
                {loading ? 'Submitting Application...' : 'Submit Application'}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                By submitting this application, you acknowledge that we'll contact you via email 
                with updates about your application status. You can create an account later to 
                manage your services online.
              </p>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};