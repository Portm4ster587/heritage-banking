import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BankingHeader } from "../components/BankingHeader";
import { CardShowcase } from "../components/CardShowcase";
import { AnimatedHeritageLogo } from "../components/AnimatedHeritageLogo";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GuestApplicationForm } from "../components/GuestApplicationForm";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Shield, Zap, Users } from "lucide-react";
import bankingHeroImage from "@/assets/banking-hero.jpg";

const Index = () => {
  const { user } = useAuth();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showGuestApplication, setShowGuestApplication] = useState(false);
  const [applicationType, setApplicationType] = useState<'checking' | 'savings' | 'business' | 'credit_card' | 'personal_loan' | 'home_loan' | 'auto_loan' | 'business_loan'>('checking');
  const [showCards, setShowCards] = useState(false);

  const features = [
    {
      title: 'Secure Banking',
      description: 'Bank-level security with 256-bit encryption',
      icon: Shield,
      color: 'bg-blue-500'
    },
    {
      title: 'Instant Transfers',
      description: 'Real-time money transfers 24/7',
      icon: Zap,
      color: 'bg-green-500'
    },
    {
      title: 'Premium Support',
      description: '24/7 dedicated customer service',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Smart Rewards',
      description: 'Earn points on every transaction',
      icon: Sparkles,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <BankingHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="min-h-[600px] bg-cover bg-center relative animate-fade-in flex items-center"
          style={{ backgroundImage: `url(${bankingHeroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-heritage-blue/95 via-heritage-blue/90 to-heritage-blue-dark/95"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          
          {/* Animated background elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-heritage-gold/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-heritage-gold/10 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-heritage-gold/15 rounded-full blur-md animate-float" style={{ animationDelay: '2s' }}></div>
          
          <div className="relative container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6 animate-slide-up">
              <div className="flex items-center space-x-4 mb-6">
                <AnimatedHeritageLogo size="lg" isActive={true} variant="loading" />
                <div>
                  <h1 className="text-4xl lg:text-6xl font-bold animate-fade-in text-heritage-gold">
                    HERITAGE
                  </h1>
                  <p className="text-xl lg:text-2xl text-heritage-gold/90">BANK</p>
                </div>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 animate-fade-in">
                Banking Excellence Since 1892
              </h2>
              <p className="text-xl mb-8 text-white/90 animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s' }}>
                Experience premium banking with unmatched security, competitive rates, and personalized service. 
                Join thousands of satisfied customers who trust Heritage Bank.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Button 
                  size="lg" 
                  onClick={() => setShowCards(true)}
                  className="bg-heritage-gold text-heritage-blue hover:bg-heritage-gold/90 px-8 py-4 font-semibold text-lg banking-button pulse-glow"
                >
                  Explore Our Cards
                </Button>
                {user ? (
                  <Link to="/dashboard">
                    <Button 
                      size="lg"
                      className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 px-8 py-4 font-semibold text-lg banking-button w-full sm:w-auto border-2 border-white/40"
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth">
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-2 border-heritage-gold text-heritage-gold hover:bg-heritage-gold hover:text-heritage-blue px-8 py-4 font-semibold text-lg banking-button w-full sm:w-auto"
                    >
                      Sign In / Register
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            
            {/* Hero Features */}
            <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center mb-3`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-white/80">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 space-y-20">
        {/* Quick Apply Section */}
        <section className="text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-primary mb-6">Start Your Banking Journey</h2>
            <p className="text-xl text-muted-foreground mb-8">
              No account required. Apply in minutes and get approved instantly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="banking-card hover-lift cursor-pointer group border-2 hover:border-heritage-gold transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-heritage-blue rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-heritage-gold" />
                  </div>
                  <CardTitle className="text-xl">Checking Account</CardTitle>
                  <CardDescription>No fees, unlimited transactions</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    size="lg" 
                    onClick={() => {
                      setApplicationType('checking');
                      setShowGuestApplication(true);
                    }}
                    className="w-full bg-heritage-gold text-heritage-blue hover:bg-heritage-gold/90 font-semibold"
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="banking-card hover-lift cursor-pointer group border-2 hover:border-heritage-gold transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-heritage-blue rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-heritage-gold" />
                  </div>
                  <CardTitle className="text-xl">Savings Account</CardTitle>
                  <CardDescription>High yield with competitive rates</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    size="lg" 
                    onClick={() => {
                      setApplicationType('savings');
                      setShowGuestApplication(true);
                    }}
                    className="w-full bg-heritage-gold text-heritage-blue hover:bg-heritage-gold/90 font-semibold"
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="banking-card hover-lift cursor-pointer group border-2 hover:border-heritage-gold transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-heritage-blue rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-heritage-gold" />
                  </div>
                  <CardTitle className="text-xl">Credit Cards</CardTitle>
                  <CardDescription>Premium rewards and benefits</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    size="lg" 
                    onClick={() => setShowCards(true)}
                    className="w-full bg-heritage-gold text-heritage-blue hover:bg-heritage-gold/90 font-semibold"
                  >
                    Explore Cards
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-heritage-blue text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <AnimatedHeritageLogo size="sm" />
                <div>
                  <h3 className="text-lg font-bold text-heritage-gold">HERITAGE BANK</h3>
                  <p className="text-xs text-white/80">Excellence Since 1892</p>
                </div>
              </div>
              <p className="text-white/80 text-sm">
                Your trusted financial partner with bank-level security and personalized service. 
                FDIC insured up to $250,000.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-heritage-gold">Services</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>Personal Banking</li>
                <li>Business Banking</li>
                <li>Investment Services</li>
                <li>Mortgage Lending</li>
                <li>Credit Cards</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-heritage-gold">Support</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>24/7 Customer Service</li>
                <li>Find ATM/Branch</li>
                <li>Security Center</li>
                <li>Mobile Banking App</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-heritage-gold">Contact</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>1-800-HERITAGE</li>
                <li>support@heritage.bank</li>
                <li>24/7 Phone Support</li>
                <li>FDIC Member #123456</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-white/60 text-sm">
              © 2024 Heritage Bank. All rights reserved. Member FDIC. Equal Housing Lender.
            </p>
          </div>
        </div>
      </footer>

      {/* Card Showcase Modal */}
      <Dialog open={showCards} onOpenChange={setShowCards}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Heritage Bank Cards & Loans</DialogTitle>
          </DialogHeader>
          <CardShowcase onApply={(type) => {
            setApplicationType(type as any);
            setShowCards(false);
            setShowGuestApplication(true);
          }} />
        </DialogContent>
      </Dialog>

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
    </div>
  );
};

export default Index;
