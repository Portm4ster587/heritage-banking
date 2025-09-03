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
import { GuestApplicationForm } from "../components/GuestApplicationForm";
import { FileText, Home, Car, Building, DollarSign, CreditCard } from "lucide-react";
import bankingHeroImage from "@/assets/banking-hero.jpg";

const Index = () => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showGuestApplication, setShowGuestApplication] = useState(false);
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
                <Button 
                  size="lg" 
                  onClick={() => {
                    setApplicationType('checking');
                    setShowGuestApplication(true);
                  }}
                  className="bg-accent text-accent-foreground hover:bg-accent-light px-8 py-3 font-semibold banking-button pulse-glow"
                >
                  Quick Apply (No Account Required)
                </Button>
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

      {/* Simplified Main Content */}
      <main className="container mx-auto px-6 py-12 space-y-16">
        {/* Quick Services Grid */}
        <section className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-4">Banking Services</h2>
            <p className="text-lg text-muted-foreground">Everything you need for modern banking</p>
          </div>
          <QuickActions />
        </section>

        {/* Featured Products */}
        <section className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quick Apply Card */}
            <Card className="banking-card hover-lift cursor-pointer group">
              <CardHeader>
                <CardTitle className="text-xl text-center">Quick Account Opening</CardTitle>
                <CardDescription className="text-center">Open an account in minutes with our streamlined process</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  size="lg" 
                  onClick={() => {
                    setApplicationType('checking');
                    setShowGuestApplication(true);
                  }}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent-light font-semibold"
                >
                  Start Application
                </Button>
              </CardContent>
            </Card>

            {/* Credit Cards Preview */}
            <Card className="banking-card hover-lift cursor-pointer group">
              <CardHeader>
                <CardTitle className="text-xl text-center">Heritage Credit Cards</CardTitle>
                <CardDescription className="text-center">Discover our range of premium credit cards with exclusive benefits</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => {
                    setApplicationType('credit_card');
                    setShowGuestApplication(true);
                  }}
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
                >
                  Explore Cards
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
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

      {/* Guest Application Modal */}
      <Dialog open={showGuestApplication} onOpenChange={setShowGuestApplication}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quick Application - No Account Required</DialogTitle>
          </DialogHeader>
          <GuestApplicationForm 
            applicationType={applicationType}
            onSuccess={() => setShowGuestApplication(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Regular Application Form Modal */}
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
