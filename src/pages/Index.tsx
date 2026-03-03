import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BankingHeader } from "../components/BankingHeader";
import { CardShowcase } from "../components/CardShowcase";
import { AnimatedHeritageLogo } from "../components/AnimatedHeritageLogo";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GuestApplicationForm } from "../components/GuestApplicationForm";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Shield, Zap, Users, Phone, Mail, MapPin, Landmark, Building2, Smartphone, CreditCard, TrendingUp } from "lucide-react";
import { CustomerChatWidget } from "../components/CustomerChatWidget";
import { HeroSection } from "../components/homepage/HeroSection";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

// New Heritage branding images
import heritageHQExterior from "@/assets/heritage-hq-exterior.png";
import heritageLobby from "@/assets/heritage-lobby-luxury.png";
import heritagePremiumCards from "@/assets/heritage-premium-cards.png";
import heritageTeam from "@/assets/heritage-team-boardroom.png";
import heritageATM from "@/assets/heritage-atm-modern.png";
import heritageMobile from "@/assets/heritage-mobile-app.png";

const Index = () => {
  const { user } = useAuth();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showGuestApplication, setShowGuestApplication] = useState(false);
  const [applicationType, setApplicationType] = useState<'checking' | 'savings' | 'business' | 'credit_card' | 'personal_loan' | 'home_loan' | 'auto_loan' | 'business_loan'>('checking');
  const [showCards, setShowCards] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  // Auto-slide effect for the carousel
  useEffect(() => {
    if (!carouselApi) return;
    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 3500);
    return () => clearInterval(interval);
  }, [carouselApi]);

  return (
    <div className="min-h-screen bg-background">
      <BankingHeader />
      
      <HeroSection 
        user={user}
        onOpenCards={() => setShowCards(true)}
        onOpenApplication={() => setShowGuestApplication(true)}
      />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 space-y-20">
        {/* Quick Apply Section */}
        <section className="text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-heritage-blue dark:text-heritage-gold mb-4">Open Your Heritage Account</h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Choose from our comprehensive range of banking products designed for your financial success.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Personal Checking */}
              <Card className="group border hover:border-heritage-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-heritage-gold/5 bg-card">
                <CardHeader className="text-center">
                  <div className="w-14 h-14 bg-heritage-blue rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-105 transition-transform">
                    <Shield className="w-7 h-7 text-heritage-gold" />
                  </div>
                  <CardTitle className="text-lg text-heritage-blue dark:text-heritage-gold font-bold">Personal Checking</CardTitle>
                  <CardDescription className="text-muted-foreground">No monthly fees</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    size="lg" 
                    onClick={() => { setApplicationType('checking'); setShowGuestApplication(true); }}
                    className="w-full bg-heritage-gold text-heritage-blue hover:bg-heritage-gold/90 font-bold shadow-sm"
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>

              {/* Personal Savings */}
              <Card className="group border hover:border-heritage-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-heritage-gold/5 bg-card">
                <CardHeader className="text-center">
                  <div className="w-14 h-14 bg-heritage-blue rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-105 transition-transform">
                    <TrendingUp className="w-7 h-7 text-heritage-gold" />
                  </div>
                  <CardTitle className="text-lg text-heritage-blue dark:text-heritage-gold font-bold">Personal Savings</CardTitle>
                  <CardDescription className="text-muted-foreground">High yield rates</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    size="lg" 
                    onClick={() => { setApplicationType('savings'); setShowGuestApplication(true); }}
                    className="w-full bg-heritage-gold text-heritage-blue hover:bg-heritage-gold/90 font-bold shadow-sm"
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>

              {/* Business Checking */}
              <Card className="group border hover:border-heritage-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-heritage-gold/5 bg-card">
                <CardHeader className="text-center">
                  <div className="w-14 h-14 bg-heritage-blue rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-105 transition-transform">
                    <Building2 className="w-7 h-7 text-heritage-gold" />
                  </div>
                  <CardTitle className="text-lg text-heritage-blue dark:text-heritage-gold font-bold">Business Checking</CardTitle>
                  <CardDescription className="text-muted-foreground">Designed for business</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    size="lg" 
                    onClick={() => { setApplicationType('business'); setShowGuestApplication(true); }}
                    className="w-full bg-heritage-gold text-heritage-blue hover:bg-heritage-gold/90 font-bold shadow-sm"
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>

              {/* Business Savings */}
              <Card className="group border hover:border-heritage-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-heritage-gold/5 bg-card">
                <CardHeader className="text-center">
                  <div className="w-14 h-14 bg-heritage-blue rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-105 transition-transform">
                    <Sparkles className="w-7 h-7 text-heritage-gold" />
                  </div>
                  <CardTitle className="text-lg text-heritage-blue dark:text-heritage-gold font-bold">Business Savings</CardTitle>
                  <CardDescription className="text-muted-foreground">Grow your business</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    size="lg" 
                    onClick={() => { setApplicationType('savings'); setShowGuestApplication(true); }}
                    className="w-full bg-heritage-gold text-heritage-blue hover:bg-heritage-gold/90 font-bold shadow-sm"
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Loan Products */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-heritage-blue dark:text-heritage-gold mb-6">Loan Products & Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="group border hover:border-heritage-gold/50 transition-all duration-300 hover:shadow-lg bg-card">
                  <CardHeader className="text-center">
                    <CardTitle className="text-heritage-blue dark:text-heritage-gold font-bold">Mortgage Loans</CardTitle>
                    <CardDescription className="text-muted-foreground">Home financing solutions</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      onClick={() => { setApplicationType('home_loan'); setShowGuestApplication(true); }}
                      className="w-full bg-heritage-blue hover:bg-heritage-blue-dark text-white font-bold"
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group border hover:border-heritage-gold/50 transition-all duration-300 hover:shadow-lg bg-card">
                  <CardHeader className="text-center">
                    <CardTitle className="text-heritage-blue dark:text-heritage-gold font-bold">IRA Accounts</CardTitle>
                    <CardDescription className="text-muted-foreground">Retirement planning</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      onClick={() => setShowGuestApplication(true)}
                      className="w-full bg-heritage-blue hover:bg-heritage-blue-dark text-white font-bold"
                    >
                      Open IRA
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group border hover:border-heritage-gold/50 transition-all duration-300 hover:shadow-lg bg-card">
                  <CardHeader className="text-center">
                    <CardTitle className="text-heritage-blue dark:text-heritage-gold font-bold text-xl">Credit Cards</CardTitle>
                    <CardDescription className="text-muted-foreground">Premium rewards cards</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      onClick={() => setShowCards(true)}
                      className="w-full bg-gradient-to-r from-heritage-gold to-amber-500 text-heritage-blue hover:from-heritage-gold/90 hover:to-amber-500/90 font-bold text-lg py-6 shadow-md hover:shadow-lg transition-all"
                    >
                      ✨ Explore Premium Cards
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Banking Services Showcase - Image Carousel */}
        <section className="py-16 bg-muted/30 rounded-3xl">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-4 text-heritage-blue dark:text-heritage-gold">Experience Heritage Banking</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">A legacy of trust, innovation, and premium financial services since 1892.</p>
            <Carousel 
              opts={{ loop: true, align: "start" }} 
              className="w-full"
              setApi={setCarouselApi}
            >
              <CarouselContent>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="relative h-72 rounded-xl overflow-hidden shadow-xl group">
                    <img 
                      src={heritageHQExterior} 
                      alt="Heritage Bank Headquarters" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-heritage-blue/80 via-heritage-blue/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-bold text-lg">Our Headquarters</p>
                      <p className="text-sm text-white/80">New York Financial District</p>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="relative h-72 rounded-xl overflow-hidden shadow-xl group">
                    <img 
                      src={heritageLobby} 
                      alt="Heritage Bank Luxury Lobby" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-heritage-blue/80 via-heritage-blue/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-bold text-lg">Premium Service</p>
                      <p className="text-sm text-white/80">World-class banking experience</p>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="relative h-72 rounded-xl overflow-hidden shadow-xl group">
                    <img 
                      src={heritagePremiumCards} 
                      alt="Heritage Bank Premium Cards" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-heritage-blue/80 via-heritage-blue/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-bold text-lg">Premium Cards</p>
                      <p className="text-sm text-white/80">Exclusive rewards & benefits</p>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="relative h-72 rounded-xl overflow-hidden shadow-xl group">
                    <img 
                      src={heritageTeam} 
                      alt="Heritage Bank Advisory Team" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-heritage-blue/80 via-heritage-blue/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-bold text-lg">Expert Advisors</p>
                      <p className="text-sm text-white/80">Dedicated financial guidance</p>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="relative h-72 rounded-xl overflow-hidden shadow-xl group">
                    <img 
                      src={heritageATM} 
                      alt="Heritage Bank Modern ATM" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-heritage-blue/80 via-heritage-blue/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-bold text-lg">ATM Network</p>
                      <p className="text-sm text-white/80">Fee-free withdrawals nationwide</p>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="relative h-72 rounded-xl overflow-hidden shadow-xl group">
                    <img 
                      src={heritageMobile} 
                      alt="Heritage Bank Mobile App" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-heritage-blue/80 via-heritage-blue/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-bold text-lg">Mobile Banking</p>
                      <p className="text-sm text-white/80">Bank anywhere, anytime</p>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-br from-heritage-blue via-heritage-blue-dark to-heritage-blue text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <AnimatedHeritageLogo size="sm" />
                <div>
                  <h3 className="text-xl font-bold text-heritage-gold">HERITAGE BANK</h3>
                  <p className="text-xs text-heritage-gold/80">Excellence Since 1892</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2 text-white/90 text-sm">
                  <Shield className="w-4 h-4 text-heritage-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-heritage-gold">Banking You Can Trust</strong>
                    <p className="text-xs text-white/80 leading-relaxed mt-1">
                      Join over 100,000 satisfied customers who've chosen Heritage Bank for security, innovation, and exceptional service.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-heritage-gold/90 font-semibold mb-2 mt-4 flex items-center">
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                FDIC Insured up to $250,000
              </p>
              <p className="text-xs text-white/70">
                Member FDIC | Equal Housing Lender | NMLS #123456
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-heritage-gold text-lg flex items-center">
                <Landmark className="w-5 h-5 mr-2" />
                Banking Services
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/auth" className="hover:text-heritage-gold transition-colors">Personal Checking</Link></li>
                <li><Link to="/auth" className="hover:text-heritage-gold transition-colors">High-Yield Savings</Link></li>
                <li><Link to="/auth" className="hover:text-heritage-gold transition-colors">Business Banking</Link></li>
                <li><Link to="/auth" className="hover:text-heritage-gold transition-colors">Credit Cards</Link></li>
                <li><Link to="/auth" className="hover:text-heritage-gold transition-colors">Home Loans</Link></li>
                <li><Link to="/auth" className="hover:text-heritage-gold transition-colors">Auto Financing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-heritage-gold text-lg flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Contact Us
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-heritage-gold">Customer Service</p>
                  <p className="text-white/90 flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5" />1-800-HERITAGE</p>
                  <p className="text-white/90 flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5" />(800) 437-4824</p>
                  <p className="text-white/70 text-xs">Available 24/7</p>
                </div>
                <div>
                  <p className="font-semibold text-heritage-gold">Email</p>
                  <p className="text-white/90 flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5" />support@heritagebank.com</p>
                  <p className="text-white/90 flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5" />business@heritagebank.com</p>
                </div>
                <div>
                  <p className="font-semibold text-heritage-gold">Headquarters</p>
                  <p className="text-white/90 flex items-start">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                    <span>123 Heritage Plaza<br />New York, NY 10001</span>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-heritage-gold text-lg flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/auth" className="hover:text-heritage-gold transition-colors">Online Banking Login</Link></li>
                <li><Link to="/auth" className="hover:text-heritage-gold transition-colors">Open an Account</Link></li>
                <li><Link to="/dashboard" className="hover:text-heritage-gold transition-colors">Dashboard</Link></li>
                <li><Link to="/about" className="hover:text-heritage-gold transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-heritage-gold transition-colors">Contact</Link></li>
                <li><button onClick={() => setShowCards(true)} className="hover:text-heritage-gold transition-colors text-left">View Cards</button></li>
              </ul>
            </div>
          </div>

          {/* Call-to-Action Banner */}
          <div className="mt-12 bg-heritage-gold/10 border border-heritage-gold/30 rounded-xl p-6 text-center">
            <h4 className="text-2xl font-bold text-heritage-gold mb-2">Ready to Experience Premium Banking?</h4>
            <p className="text-white/90 mb-4">Join Heritage Bank today and discover why we're America's most trusted bank!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-heritage-gold text-heritage-blue hover:bg-heritage-gold/90 font-bold">
                  Open Account Now
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-heritage-gold text-heritage-gold hover:bg-heritage-gold hover:text-heritage-blue">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>

          <div className="border-t border-heritage-gold/30 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
              <p className="text-white/80 text-sm">
                © 2025 Heritage Bank. All rights reserved. | Banking Excellence Since 1892
              </p>
              <div className="flex gap-4 text-sm text-white/80">
                <a href="#" className="hover:text-heritage-gold transition-colors">Privacy Policy</a>
                <span>•</span>
                <a href="#" className="hover:text-heritage-gold transition-colors">Terms of Service</a>
                <span>•</span>
                <a href="#" className="hover:text-heritage-gold transition-colors">Accessibility</a>
                <span>•</span>
                <a href="#" className="hover:text-heritage-gold transition-colors">Security</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <CustomerChatWidget />

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
