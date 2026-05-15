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
import { Sparkles, Shield, Zap, Phone, Mail, MapPin, Landmark, Building2, TrendingUp } from "lucide-react";
import { CustomerChatWidget } from "../components/CustomerChatWidget";
import { HeroSection } from "../components/homepage/HeroSection";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

// Photorealistic Heritage branding images (carousel only – NOT the hero building)
import heritageCardsPhoto from "@/assets/heritage-cards-photo.png";
import heritageStaffPhoto from "@/assets/heritage-staff-photo.png";
import heritageAtmPhoto from "@/assets/heritage-atm-photo.png";
import heritageInteriorPhoto from "@/assets/heritage-interior-photo.png";
import heritageDigitalPhoto from "@/assets/heritage-digital-photo.png";

const Index = () => {
  const { user } = useAuth();
  const [showGuestApplication, setShowGuestApplication] = useState(false);
  const [applicationType, setApplicationType] = useState<'checking' | 'savings' | 'business' | 'credit_card' | 'personal_loan' | 'home_loan' | 'auto_loan' | 'business_loan'>('checking');
  const [showCards, setShowCards] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!carouselApi) return;
    const interval = setInterval(() => { carouselApi.scrollNext(); }, 3500);
    return () => clearInterval(interval);
  }, [carouselApi]);

  const carouselSlides = [
    { image: heritageInteriorPhoto, title: "Premium Lobby", subtitle: "World-class banking experience" },
    { image: heritageCardsPhoto, title: "Premium Cards", subtitle: "Exclusive rewards & benefits" },
    { image: heritageStaffPhoto, title: "Expert Advisors", subtitle: "Dedicated financial guidance" },
    { image: heritageAtmPhoto, title: "ATM Network", subtitle: "Fee-free withdrawals nationwide" },
    { image: heritageDigitalPhoto, title: "Mobile Banking", subtitle: "Bank anywhere, anytime" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <BankingHeader />
      
      <HeroSection 
        user={user}
        onOpenCards={() => setShowCards(true)}
        onOpenApplication={() => setShowGuestApplication(true)}
      />

      <main className="container mx-auto px-6 py-16 space-y-20">
        {/* Quick Apply Section */}
        <section className="text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-heritage-blue dark:text-heritage-gold mb-4">Open Your Heritage Account</h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Choose from our comprehensive range of banking products designed for your financial success.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Shield, title: "Personal Checking", desc: "No monthly fees", type: "checking" as const },
                { icon: TrendingUp, title: "Personal Savings", desc: "High yield rates", type: "savings" as const },
                { icon: Building2, title: "Business Checking", desc: "Designed for business", type: "business" as const },
                { icon: Sparkles, title: "Business Savings", desc: "Grow your business", type: "savings" as const },
              ].map((item) => (
                <Card key={item.title} className="group border hover:border-heritage-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-heritage-gold/5 bg-card">
                  <CardHeader className="text-center">
                    <div className="w-14 h-14 bg-heritage-blue rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-105 transition-transform">
                      <item.icon className="w-7 h-7 text-heritage-gold" />
                    </div>
                    <CardTitle className="text-lg text-heritage-blue dark:text-heritage-gold font-bold">{item.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">{item.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      size="lg" 
                      onClick={() => { setApplicationType(item.type); setShowGuestApplication(true); }}
                      className="w-full bg-heritage-gold text-heritage-blue hover:bg-heritage-gold/90 font-bold shadow-sm"
                    >
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
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
                    <Button onClick={() => { setApplicationType('home_loan'); setShowGuestApplication(true); }} className="w-full bg-heritage-blue hover:bg-heritage-blue-dark text-white font-bold">Learn More</Button>
                  </CardContent>
                </Card>
                <Card className="group border hover:border-heritage-gold/50 transition-all duration-300 hover:shadow-lg bg-card">
                  <CardHeader className="text-center">
                    <CardTitle className="text-heritage-blue dark:text-heritage-gold font-bold">IRA Accounts</CardTitle>
                    <CardDescription className="text-muted-foreground">Retirement planning</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button onClick={() => setShowGuestApplication(true)} className="w-full bg-heritage-blue hover:bg-heritage-blue-dark text-white font-bold">Open IRA</Button>
                  </CardContent>
                </Card>
                <Card className="group border hover:border-heritage-gold/50 transition-all duration-300 hover:shadow-lg bg-card">
                  <CardHeader className="text-center">
                    <CardTitle className="text-heritage-blue dark:text-heritage-gold font-bold text-xl">Credit Cards</CardTitle>
                    <CardDescription className="text-muted-foreground">Premium rewards cards</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button onClick={() => setShowCards(true)} className="w-full bg-gradient-to-r from-heritage-gold to-amber-500 text-heritage-blue hover:from-heritage-gold/90 hover:to-amber-500/90 font-bold text-lg py-6 shadow-md">✨ Explore Premium Cards</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Banking Services Showcase Carousel – unique images, no duplicates */}
        <section className="py-16 bg-muted/30 rounded-3xl">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-4 text-heritage-blue dark:text-heritage-gold">Experience Heritage Banking</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">A legacy of trust, innovation, and premium financial services since 1892.</p>
            <Carousel opts={{ loop: true, align: "start" }} className="w-full" setApi={setCarouselApi}>
              <CarouselContent>
                {carouselSlides.map((slide, i) => (
                  <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                    <div className="relative h-72 rounded-xl overflow-hidden shadow-xl group">
                      <img 
                        src={slide.image} 
                        alt={slide.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-heritage-blue/80 via-heritage-blue/10 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="font-bold text-lg">{slide.title}</p>
                        <p className="text-sm text-white/80">{slide.subtitle}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        </section>
      </main>

      {/* Footer */}
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
              <p className="text-xs text-white/80 leading-relaxed mb-3">
                Join over 100,000 satisfied customers who've chosen First Heritage Bank of America for security, innovation, and exceptional service.
              </p>
              <p className="text-xs text-heritage-gold/90 font-semibold flex items-center"><Shield className="w-3.5 h-3.5 mr-1.5" />FDIC Insured up to $250,000</p>
              <p className="text-xs text-white/70 mt-1">Member FDIC | Equal Housing Lender | NMLS #123456</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-heritage-gold text-lg flex items-center"><Landmark className="w-5 h-5 mr-2" />Banking Services</h4>
              <ul className="space-y-2 text-sm">
                {["Personal Checking","High-Yield Savings","Business Banking","Credit Cards","Home Loans","Auto Financing"].map(s=>(
                  <li key={s}><Link to="/auth" className="hover:text-heritage-gold transition-colors">{s}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-heritage-gold text-lg flex items-center"><Phone className="w-5 h-5 mr-2" />Contact Us</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-heritage-gold">Customer Service</p>
                  <p className="text-white/90 flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5" />1-800-HERITAGE</p>
                  <p className="text-white/70 text-xs">Available 24/7</p>
                </div>
                <div>
                  <p className="font-semibold text-heritage-gold">Email</p>
                  <p className="text-white/90 flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5" />support@heritagebank.com</p>
                </div>
                <div>
                  <p className="font-semibold text-heritage-gold">Headquarters</p>
                  <p className="text-white/90 flex items-start"><MapPin className="w-3.5 h-3.5 mr-1.5 mt-0.5 flex-shrink-0" /><span>123 Heritage Plaza<br/>New York, NY 10001</span></p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-heritage-gold text-lg flex items-center"><Zap className="w-5 h-5 mr-2" />Quick Links</h4>
              <ul className="space-y-2 text-sm">
                {[{to:"/auth",l:"Online Banking Login"},{to:"/auth",l:"Open an Account"},{to:"/dashboard",l:"Dashboard"},{to:"/about",l:"About Us"},{to:"/contact",l:"Contact"}].map(lk=>(
                  <li key={lk.l}><Link to={lk.to} className="hover:text-heritage-gold transition-colors">{lk.l}</Link></li>
                ))}
                <li><button onClick={() => setShowCards(true)} className="hover:text-heritage-gold transition-colors text-left">View Cards</button></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-heritage-gold/10 border border-heritage-gold/30 rounded-xl p-6 text-center">
            <h4 className="text-2xl font-bold text-heritage-gold mb-2">Ready to Experience Premium Banking?</h4>
            <p className="text-white/90 mb-4">Join First Heritage Bank of America today and discover why we're America's most trusted bank!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth"><Button size="lg" className="bg-heritage-gold text-heritage-blue hover:bg-heritage-gold/90 font-bold">Open Account Now</Button></Link>
              <Link to="/contact"><Button size="lg" variant="outline" className="border-heritage-gold text-heritage-gold hover:bg-heritage-gold hover:text-heritage-blue">Contact Us</Button></Link>
            </div>
          </div>

          <div className="border-t border-heritage-gold/30 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
              <p className="text-white/80 text-sm">© 2025 First Heritage Bank of America. All rights reserved. | Banking Excellence Since 1892</p>
              <div className="flex gap-4 text-sm text-white/80">
                {["Privacy Policy","Terms of Service","Accessibility","Security"].map((t,i)=>(
                  <span key={t}>{i>0&&<span className="mr-4">•</span>}<a href="#" className="hover:text-heritage-gold transition-colors">{t}</a></span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      <CustomerChatWidget />

      <Dialog open={showCards} onOpenChange={setShowCards}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-2xl">First Heritage Bank of America Cards & Loans</DialogTitle></DialogHeader>
          <CardShowcase onApply={(type) => { setApplicationType(type as any); setShowCards(false); setShowGuestApplication(true); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={showGuestApplication} onOpenChange={setShowGuestApplication}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Quick Application - No Account Required</DialogTitle></DialogHeader>
          <GuestApplicationForm applicationType={applicationType} onSuccess={() => setShowGuestApplication(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
