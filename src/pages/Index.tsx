import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BankingHeader } from "../components/BankingHeader";
import { AccountOverview } from "../components/AccountOverview";
import { CreditCardSection } from "../components/CreditCardSection";
import { QuickActions } from "../components/QuickActions";
import bankingHeroImage from "@/assets/banking-hero.jpg";

const Index = () => {
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
        <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <CreditCardSection />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '1s' }}>
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
    </div>
  );
};

export default Index;
