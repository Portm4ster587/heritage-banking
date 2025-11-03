import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, User, MapPin, Briefcase, Shield, CheckCircle2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

const securityQuestions = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "What is the name of your favorite teacher?",
  "What street did you grow up on?",
  "What was your childhood nickname?",
  "What is your favorite book?",
];

const accountSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, 'First name required').max(50),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name required').max(50),
  dateOfBirth: z.string().min(1, 'Date of birth required'),
  ssn: z.string().length(9, 'SSN must be 9 digits'),
  citizenship: z.string().min(1, 'Citizenship required'),
  
  // Contact
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone required'),
  alternatePhone: z.string().optional(),
  
  // Address
  streetAddress: z.string().min(5, 'Address required'),
  aptUnit: z.string().optional(),
  city: z.string().min(2, 'City required'),
  state: z.string().length(2, 'State code required'),
  zipCode: z.string().min(5, 'ZIP code required'),
  yearsAtAddress: z.string().min(1, 'Years at address required'),
  
  // Previous Address (conditional)
  prevStreetAddress: z.string().optional(),
  prevCity: z.string().optional(),
  prevState: z.string().optional(),
  prevZipCode: z.string().optional(),
  
  // Employment
  employmentStatus: z.string().min(1, 'Employment status required'),
  employerName: z.string().optional(),
  occupation: z.string().optional(),
  employerPhone: z.string().optional(),
  yearsEmployed: z.string().optional(),
  annualIncome: z.string().min(1, 'Annual income required'),
  otherIncomeSource: z.string().optional(),
  otherIncomeAmount: z.string().optional(),
  
  // Security Questions
  securityQuestion1: z.string().min(1, 'Security question 1 required'),
  securityAnswer1: z.string().min(2, 'Security answer 1 required'),
  securityQuestion2: z.string().min(1, 'Security question 2 required'),
  securityAnswer2: z.string().min(2, 'Security answer 2 required'),
  securityQuestion3: z.string().optional(),
  securityAnswer3: z.string().optional(),
  
  // Product Details
  accountType: z.string().min(1, 'Account type required'),
  initialDeposit: z.string().min(1, 'Initial deposit amount required'),
  fundingSource: z.string().min(1, 'Funding source required'),
  
  // Consents
  consentCreditCheck: z.boolean().refine((val) => val === true, 'Credit check consent required'),
  consentTerms: z.boolean().refine((val) => val === true, 'Terms consent required'),
  consentPrivacy: z.boolean().refine((val) => val === true, 'Privacy consent required'),
  consentElectronic: z.boolean().refine((val) => val === true, 'Electronic communications consent required'),
});

type AccountFormData = z.infer<typeof accountSchema>;

export default function OpenAccount() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      citizenship: 'US',
      accountType: 'personal_checking',
      consentCreditCheck: false,
      consentTerms: false,
      consentPrivacy: false,
      consentElectronic: false,
    },
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const onSubmit = async (data: AccountFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to submit your application.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      // Simple encryption for demo (in production, use proper encryption)
      const encryptData = (data: string) => btoa(data);

      const applicationData: any = {
        user_id: user.id,
        application_type: data.accountType,
        first_name: data.firstName,
        middle_name: data.middleName || null,
        last_name: data.lastName,
        date_of_birth: data.dateOfBirth,
        ssn_encrypted: encryptData(data.ssn),
        ssn_last_4: data.ssn.slice(-4),
        citizenship: data.citizenship,
        email: data.email,
        phone: data.phone,
        alternate_phone: data.alternatePhone || null,
        street_address: data.streetAddress,
        apt_unit: data.aptUnit || null,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode,
        years_at_address: parseInt(data.yearsAtAddress),
        prev_street_address: data.prevStreetAddress || null,
        prev_city: data.prevCity || null,
        prev_state: data.prevState || null,
        prev_zip_code: data.prevZipCode || null,
        employment_status: data.employmentStatus,
        employer_name: data.employerName || null,
        occupation: data.occupation || null,
        employer_phone: data.employerPhone || null,
        years_employed: data.yearsEmployed ? parseInt(data.yearsEmployed) : null,
        annual_income: parseFloat(data.annualIncome),
        other_income_source: data.otherIncomeSource || null,
        other_income_amount: data.otherIncomeAmount ? parseFloat(data.otherIncomeAmount) : null,
        security_question_1: data.securityQuestion1,
        security_answer_1_encrypted: encryptData(data.securityAnswer1),
        security_question_2: data.securityQuestion2,
        security_answer_2_encrypted: encryptData(data.securityAnswer2),
        security_question_3: data.securityQuestion3 || null,
        security_answer_3_encrypted: data.securityAnswer3 ? encryptData(data.securityAnswer3) : null,
        initial_deposit_amount: parseFloat(data.initialDeposit),
        funding_source: data.fundingSource,
        consent_credit_check: data.consentCreditCheck,
        consent_terms: data.consentTerms,
        consent_privacy: data.consentPrivacy,
        consent_electronic_communications: data.consentElectronic,
        application_number: '', // Will be auto-generated by trigger
      };

      const { error } = await supabase.from('account_applications').insert(applicationData);

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Your application has been submitted successfully. We'll review it within 24-48 hours.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Application error:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    const fields = getStepFields(step);
    const isValid = await form.trigger(fields);
    if (isValid) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const getStepFields = (currentStep: number): (keyof AccountFormData)[] => {
    switch (currentStep) {
      case 1:
        return ['firstName', 'middleName', 'lastName', 'dateOfBirth', 'ssn', 'citizenship'];
      case 2:
        return ['email', 'phone', 'streetAddress', 'city', 'state', 'zipCode', 'yearsAtAddress'];
      case 3:
        return ['employmentStatus', 'annualIncome'];
      case 4:
        return ['securityQuestion1', 'securityAnswer1', 'securityQuestion2', 'securityAnswer2'];
      case 5:
        return ['accountType', 'initialDeposit', 'fundingSource', 'consentCreditCheck', 'consentTerms', 'consentPrivacy', 'consentElectronic'];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-heritage-blue via-heritage-blue-dark to-heritage-blue py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="text-heritage-gold hover:bg-white/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-3xl text-heritage-blue">Open Your Heritage Account</CardTitle>
              <CardDescription className="text-lg">Complete American Banking Application</CardDescription>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Step {step} of {totalSteps}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardHeader>
          </Card>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <Card className="bg-white/95 backdrop-blur animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-heritage-blue">
                    <User className="w-6 h-6" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="John" />
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
                            <Input {...field} placeholder="Michael" />
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
                            <Input {...field} placeholder="Smith" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
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
                      name="citizenship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Citizenship *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="ssn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Security Number *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="password" 
                            placeholder="123456789" 
                            maxLength={9}
                          />
                        </FormControl>
                        <FormDescription>9 digits, no spaces or dashes</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 2: Contact & Address */}
            {step === 2 && (
              <Card className="bg-white/95 backdrop-blur animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-heritage-blue">
                    <MapPin className="w-6 h-6" />
                    Contact & Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} placeholder="john@example.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="(555) 123-4567" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="streetAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="123 Main Street" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="aptUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apt/Unit</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Apt 4B" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="New York" />
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
                            <Input {...field} placeholder="NY" maxLength={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="10001" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="yearsAtAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years at Current Address *</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} placeholder="3" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 3: Employment */}
            {step === 3 && (
              <Card className="bg-white/95 backdrop-blur animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-heritage-blue">
                    <Briefcase className="w-6 h-6" />
                    Employment & Income
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
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="employed">Employed</SelectItem>
                            <SelectItem value="self-employed">Self-Employed</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="unemployed">Unemployed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="employerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employer Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ABC Company" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Software Engineer" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="annualIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Income *</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} placeholder="75000" />
                        </FormControl>
                        <FormDescription>Your total annual income before taxes</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 4: Security Questions */}
            {step === 4 && (
              <Card className="bg-white/95 backdrop-blur animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-heritage-blue">
                    <Shield className="w-6 h-6" />
                    Security Questions
                  </CardTitle>
                  <CardDescription>Choose security questions to protect your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="securityQuestion1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Question 1 *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a question" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {securityQuestions.map((q) => (
                                <SelectItem key={q} value={q}>{q}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="securityAnswer1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Answer *</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" placeholder="Your answer" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="securityQuestion2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Question 2 *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a question" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {securityQuestions.map((q) => (
                                <SelectItem key={q} value={q}>{q}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="securityAnswer2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Answer *</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" placeholder="Your answer" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Product Selection & Agreements */}
            {step === 5 && (
              <Card className="bg-white/95 backdrop-blur animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-heritage-blue">
                    <FileText className="w-6 h-6" />
                    Account Details & Agreements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                            <SelectItem value="personal_checking">Personal Checking</SelectItem>
                            <SelectItem value="personal_savings">Personal Savings</SelectItem>
                            <SelectItem value="business_checking">Business Checking</SelectItem>
                            <SelectItem value="business_savings">Business Savings</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="initialDeposit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Deposit Amount *</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} placeholder="100" />
                          </FormControl>
                          <FormDescription>Minimum $25</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fundingSource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Funding Source *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select source" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="check">Check</SelectItem>
                              <SelectItem value="cash">Cash Deposit</SelectItem>
                              <SelectItem value="wire">Wire Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <FormField
                      control={form.control}
                      name="consentCreditCheck"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>I authorize Heritage Bank to obtain credit reports *</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consentTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>I agree to the Terms and Conditions *</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consentPrivacy"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>I agree to the Privacy Policy *</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consentElectronic"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>I consent to receive electronic communications *</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <Card className="bg-white/95 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex justify-between">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="border-heritage-blue text-heritage-blue"
                    >
                      Previous
                    </Button>
                  )}
                  {step < totalSteps ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="ml-auto bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-blue"
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="ml-auto bg-heritage-blue hover:bg-heritage-blue-dark text-heritage-gold"
                    >
                      {loading ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}