import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BankingHeader } from "../components/BankingHeader";
import { AccountOverview } from "../components/AccountOverview";
import { EnhancedCreditCards } from "../components/EnhancedCreditCards";
import { ApplicationForm } from "../components/ApplicationForm";
import { QuickActions } from "../components/QuickActions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Home, Car, Building, DollarSign, CreditCard } from "lucide-react";
import bankingHeroImage from "@/assets/banking-hero.jpg";

const Index = () => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationType, setApplicationType] = useState<'checking' | 'savings' | 'business' | 'credit_card' | 'personal_loan' | 'home_loan' | 'auto_loan' | 'business_loan'>('checking');

  const loanProducts = [
    {
      type: 'personal_loan' as const,
      title: 'Personal Loans',
      description: 'Quick approval for personal expenses',
      rate: '2.9% APR',
      rateLabel: 'Starting rate',
      icon: FileText,
      color: 'bg-secondary'
    },
    {
      type: 'home_loan' as const,
      title: 'Home Loans', 
      description: 'Competitive rates for home purchases',
      rate: '3.2% APR',
      rateLabel: '30-year fixed',
      icon: Home,
      color: 'bg-accent'
    },
    {
      type: 'auto_loan' as const,
      title: 'Auto Loans',
      description: 'Finance your next vehicle',
      rate: '2.5% APR', 
      rateLabel: 'Starting rate',
      icon: Car,
      color: 'bg-primary'
    },
    {
      type: 'business_loan' as const,
      title: 'Business Loans',
      description: 'Grow your business with flexible financing',
      rate: '3.8% APR',
      rateLabel: 'Starting rate', 
      icon: Building,
      color: 'bg-secondary'
    }
  ];

  const accountProducts = [
    {
      type: 'checking' as const,
      title: 'Personal Checking',
      description: 'No minimum balance, unlimited transactions',
      rate: '0.05% APY',
      icon: DollarSign,
      features: ['No monthly fees', 'Mobile deposit', 'Online banking']
    },
    {
      type: 'savings' as const,
      title: 'Personal Savings',
      description: 'High yield savings with compound interest',
      rate: '2.25% APY',
      icon: DollarSign,
      features: ['FDIC insured', 'Compound interest', 'Mobile banking']
    },
    {
      type: 'business' as const,
      title: 'Business Banking',
      description: 'Banking solutions for your business',
      rate: '2.50% APY',
      icon: Building,
      features: ['Business tools', 'ACH transfers', 'Treasury services']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <BankingHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="h-96 bg-cover bg-center relative animate-fade-in"
          style={{ backgroundImage: `url(${bankingHeroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-primary-dark/90"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          {/* Animated background elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-accent/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-secondary/20 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative container mx-auto px-6 h-full flex items-center">
            <div className="text-primary-foreground max-w-2xl animate-slide-up">
              <h1 className="text-5xl font-bold mb-4 animate-fade-in">
                Welcome to Modern Banking
              </h1>
              <p className="text-xl mb-6 text-primary-foreground/90 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Experience the future of financial services with US Heritage & Investments Bank. 
                Your trusted partner for comprehensive banking solutions.
              </p>
              <div className="flex space-x-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Link to="/auth">
                  <Button 
                    size="lg" 
                    className="bg-accent text-accent-foreground hover:bg-accent-light px-8 py-3 font-semibold banking-button pulse-glow"
                  >
                    Open Account
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 py-3 font-semibold banking-button"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 space-y-20">
        <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <AccountOverview />
        </div>
        
        {/* Enhanced Credit Cards Section */}
        <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <EnhancedCreditCards 
            onApplyClick={(cardId) => {
              setApplicationType('credit_card');
              setShowApplicationForm(true);
            }}
            onAccountTypeSelect={(accountType) => {
              setApplicationType(accountType as any);
              setShowApplicationForm(true);
            }}
          />
        </div>

        {/* Loan Products Section */}
        <section className="animate-fade-in" style={{ animationDelay: '1s' }}>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">Loan Solutions</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Competitive rates and flexible terms for all your financing needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loanProducts.map((loan, index) => (
              <Card 
                key={loan.type} 
                className="banking-card hover-lift cursor-pointer group"
                onClick={() => {
                  setApplicationType(loan.type);
                  setShowApplicationForm(true);
                }}
              >
                <CardHeader>
                  <div className={`w-12 h-12 ${loan.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <loan.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-center text-lg">{loan.title}</CardTitle>
                  <CardDescription className="text-center">{loan.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-2xl font-bold text-success mb-1">{loan.rate}</p>
                  <p className="text-sm text-muted-foreground mb-4">{loan.rateLabel}</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Account Opening Section */}
        <section className="animate-fade-in" style={{ animationDelay: '1.2s' }}>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">Open Your Account Today</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose from our range of checking, savings, and business accounts
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {accountProducts.map((account, index) => (
              <Card 
                key={account.type} 
                className="banking-card hover-lift cursor-pointer group"
                onClick={() => {
                  setApplicationType(account.type);
                  setShowApplicationForm(true);
                }}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <account.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-center text-xl">{account.title}</CardTitle>
                  <CardDescription className="text-center">{account.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <p className="text-2xl font-bold text-success mb-1">{account.rate}</p>
                    <p className="text-sm text-muted-foreground">Annual Percentage Yield</p>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {account.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Open Account
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="animate-fade-in" style={{ animationDelay: '1.4s' }}>
          <QuickActions />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">US Heritage & Investments Bank</h3>
              <p className="text-primary-foreground/80 text-sm">
                Your trusted financial partner since 1892. 
                Licensed by IRS and FDIC insured.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li>Personal Banking</li>
                <li>Business Banking</li>
                <li>Investment Services</li>
                <li>Mortgage Lending</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li>Customer Service</li>
                <li>Find ATM/Branch</li>
                <li>Security Center</li>
                <li>Mobile Banking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li>1-800-HERITAGE</li>
                <li>support@usheritage.bank</li>
                <li>24/7 Customer Service</li>
                <li>FDIC Member</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Application Form Modal */}
      <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Form</DialogTitle>
          </DialogHeader>
          <ApplicationForm 
            applicationType={applicationType}
            onSuccess={() => setShowApplicationForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
