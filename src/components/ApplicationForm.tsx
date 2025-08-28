import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  FileText, 
  Shield,
  CreditCard,
  Building,
  Home,
  Car
} from 'lucide-react';

const applicationSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  middleName: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  ssnLast4: z.string().length(4, 'SSN last 4 digits must be exactly 4 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  
  // Address Information
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  postalCode: z.string().min(5, 'Postal code is required'),
  
  // Employment Information
  employmentStatus: z.string().min(1, 'Employment status is required'),
  employerName: z.string().optional(),
  jobTitle: z.string().optional(),
  workPhone: z.string().optional(),
  annualIncome: z.string().min(1, 'Annual income is required'),
  employmentLength: z.string().optional(),
  
  // Financial Information
  monthlyIncome: z.string().min(1, 'Monthly income is required'),
  monthlyExpenses: z.string().min(1, 'Monthly expenses is required'),
  existingDebt: z.string().optional(),
  assetsValue: z.string().optional(),
  
  // Application Specific
  requestedAmount: z.string().optional(),
  requestedLimit: z.string().optional(),
  purpose: z.string().optional(),
  
  // Business Information (conditional)
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  businessEin: z.string().optional(),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  yearsInBusiness: z.string().optional(),
  annualRevenue: z.string().optional(),
  
  // Agreements
  terms: z.boolean().refine((val) => val === true, 'You must agree to the terms'),
  privacy: z.boolean().refine((val) => val === true, 'You must agree to the privacy policy'),
  creditCheck: z.boolean().refine((val) => val === true, 'You must consent to credit check'),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  applicationType: 'checking' | 'savings' | 'business' | 'credit_card' | 'personal_loan' | 'home_loan' | 'auto_loan' | 'business_loan';
  onSuccess?: () => void;
}

const applicationConfig = {
  checking: {
    title: 'Personal Checking Account',
    description: 'Open a new checking account with competitive rates and no monthly fees',
    icon: User,
    color: 'bg-primary',
    showBusinessFields: false,
    showLoanFields: false,
  },
  savings: {
    title: 'Personal Savings Account', 
    description: 'Start saving with our high-yield savings account',
    icon: DollarSign,
    color: 'bg-secondary',
    showBusinessFields: false,
    showLoanFields: false,
  },
  business: {
    title: 'Business Account',
    description: 'Banking solutions designed for your business needs',
    icon: Building,
    color: 'bg-accent',
    showBusinessFields: true,
    showLoanFields: false,
  },
  credit_card: {
    title: 'Credit Card Application',
    description: 'Apply for a credit card with competitive rates and rewards',
    icon: CreditCard,
    color: 'bg-primary',
    showBusinessFields: false,
    showLoanFields: false,
  },
  personal_loan: {
    title: 'Personal Loan',
    description: 'Get funds for personal expenses with competitive rates',
    icon: FileText,
    color: 'bg-secondary',
    showBusinessFields: false,
    showLoanFields: true,
  },
  home_loan: {
    title: 'Home Loan Application',
    description: 'Finance your dream home with our mortgage solutions',
    icon: Home,
    color: 'bg-accent',
    showBusinessFields: false,
    showLoanFields: true,
  },
  auto_loan: {
    title: 'Auto Loan Application', 
    description: 'Finance your next vehicle with competitive rates',
    icon: Car,
    color: 'bg-primary',
    showBusinessFields: false,
    showLoanFields: true,
  },
  business_loan: {
    title: 'Business Loan Application',
    description: 'Grow your business with flexible financing options',
    icon: Building,
    color: 'bg-secondary',
    showBusinessFields: true,
    showLoanFields: true,
  },
};

export const ApplicationForm = ({ applicationType, onSuccess }: ApplicationFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const config = applicationConfig[applicationType];

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      email: user?.email || '',
      terms: false,
      privacy: false,
      creditCheck: false,
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit an application.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const applicationData = {
        user_id: user.id,
        application_type: applicationType,
        first_name: data.firstName,
        last_name: data.lastName,
        middle_name: data.middleName,
        date_of_birth: data.dateOfBirth,
        ssn_last4: data.ssnLast4,
        phone: data.phone,
        email: data.email,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2,
        city: data.city,
        state: data.state,
        postal_code: data.postalCode,
        country: 'US',
        employment_status: data.employmentStatus,
        employer_name: data.employerName,
        job_title: data.jobTitle,
        work_phone: data.workPhone,
        annual_income: data.annualIncome ? parseFloat(data.annualIncome) : null,
        employment_length: data.employmentLength ? parseInt(data.employmentLength) : null,
        monthly_income: data.monthlyIncome ? parseFloat(data.monthlyIncome) : null,
        monthly_expenses: data.monthlyExpenses ? parseFloat(data.monthlyExpenses) : null,
        existing_debt: data.existingDebt ? parseFloat(data.existingDebt) : null,
        assets_value: data.assetsValue ? parseFloat(data.assetsValue) : null,
        requested_amount: data.requestedAmount ? parseFloat(data.requestedAmount) : null,
        requested_limit: data.requestedLimit ? parseFloat(data.requestedLimit) : null,
        purpose: data.purpose,
        business_name: data.businessName,
        business_type: data.businessType,
        business_ein: data.businessEin,
        business_address: data.businessAddress,
        business_phone: data.businessPhone,
        years_in_business: data.yearsInBusiness ? parseInt(data.yearsInBusiness) : null,
        annual_revenue: data.annualRevenue ? parseFloat(data.annualRevenue) : null,
      };

      const { error } = await supabase
        .from('applications')
        .insert([applicationData]);

      if (error) throw error;

      toast({
        title: "Application Submitted Successfully!",
        description: "We'll review your application and contact you within 1-2 business days.",
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const IconComponent = config.icon;

  const totalSteps = config.showBusinessFields || config.showLoanFields ? 5 : 4;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="banking-card">
        <CardHeader className="text-center">
          <div className={`w-16 h-16 ${config.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">{config.title}</CardTitle>
          <CardDescription className="text-lg">{config.description}</CardDescription>
        </CardHeader>
      </Card>

      {/* Progress Steps */}
      <div className="flex justify-between items-center bg-card rounded-lg p-4">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep > i + 1 ? 'bg-success text-success-foreground' :
              currentStep === i + 1 ? 'bg-primary text-primary-foreground' :
              'bg-muted text-muted-foreground'
            }`}>
              {i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${
                currentStep > i + 1 ? 'bg-success' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <Card className="banking-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Michael" {...field} />
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
          )}

          {/* Step 2: Address Information */}
          {currentStep === 2 && (
            <Card className="banking-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1 *</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input placeholder="Apt 4B" {...field} />
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
              </CardContent>
            </Card>
          )}

          {/* Step 3: Employment & Financial Information */}
          {currentStep === 3 && (
            <Card className="banking-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Employment & Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                          <SelectItem value="self_employed">Self-Employed</SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC Company Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Software Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="annualIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Income *</FormLabel>
                        <FormControl>
                          <Input placeholder="75000" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monthlyIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Income *</FormLabel>
                        <FormControl>
                          <Input placeholder="6250" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="monthlyExpenses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Expenses *</FormLabel>
                        <FormControl>
                          <Input placeholder="3500" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="existingDebt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Existing Debt</FormLabel>
                        <FormControl>
                          <Input placeholder="15000" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Business Information (if applicable) */}
          {currentStep === 4 && config.showBusinessFields && (
            <Card className="banking-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Business LLC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <FormControl>
                          <Input placeholder="LLC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="businessEin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EIN (Tax ID)</FormLabel>
                        <FormControl>
                          <Input placeholder="12-3456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="yearsInBusiness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years in Business</FormLabel>
                        <FormControl>
                          <Input placeholder="5" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="annualRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Revenue</FormLabel>
                      <FormControl>
                        <Input placeholder="250000" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 4/5: Loan Specific Information (if applicable) */}
          {currentStep === (config.showBusinessFields ? 5 : 4) && config.showLoanFields && (
            <Card className="banking-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Loan Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="requestedAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requested Amount</FormLabel>
                        <FormControl>
                          <Input placeholder="25000" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {applicationType === 'credit_card' && (
                    <FormField
                      control={form.control}
                      name="requestedLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requested Credit Limit</FormLabel>
                          <FormControl>
                            <Input placeholder="10000" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose of Loan</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe how you plan to use the funds..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Final Step: ID Verification & Terms */}
          {currentStep === totalSteps && (
            <Card className="banking-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Identity Verification & Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ID.me Integration */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Identity Verification Required</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    We use ID.me to verify your identity securely. This helps protect against fraud and ensures compliance with banking regulations.
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('https://www.id.me/', '_blank')}
                  >
                    Verify Identity with ID.me
                  </Button>
                </div>

                {/* Terms and Agreements */}
                <div className="space-y-4">
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
                          <p className="text-sm text-muted-foreground">
                            By checking this box, I agree to the bank's terms and conditions.
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                          <p className="text-sm text-muted-foreground">
                            I understand how my personal information will be used and protected.
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            I consent to credit check *
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            I authorize the bank to check my credit history for this application.
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={loading} className="min-w-[120px]">
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};