import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, CreditCard, Send, TrendingUp, Bell, 
  CheckCircle, ArrowRight, Sparkles 
} from 'lucide-react';
import { AnimatedHeritageLogo } from '@/components/AnimatedHeritageLogo';
import { useNavigate } from 'react-router-dom';

interface WelcomeScreenProps {
  userName: string;
  onDismiss: () => void;
}

const features = [
  { icon: Shield, title: 'Bank-Grade Security', desc: 'Your funds are FDIC insured and protected 24/7' },
  { icon: CreditCard, title: 'Virtual & Physical Cards', desc: 'Manage your debit and credit cards instantly' },
  { icon: Send, title: 'Instant Transfers', desc: 'Send money to anyone, anywhere, anytime' },
  { icon: TrendingUp, title: 'Crypto Portfolio', desc: 'Buy, sell, and manage crypto assets seamlessly' },
  { icon: Bell, title: 'Real-Time Alerts', desc: 'Get notified about every transaction via email & SMS' },
];

export const WelcomeScreen = ({ userName, onDismiss }: WelcomeScreenProps) => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setStep(1), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-heritage-blue via-heritage-blue-dark to-primary flex items-center justify-center p-4 animate-fade-in">
      <Card className="max-w-md w-full bg-card/95 backdrop-blur-xl shadow-2xl border-heritage-gold/20 overflow-hidden">
        <div className="bg-gradient-to-r from-heritage-gold/10 to-heritage-gold/5 p-6 text-center">
          <div className="flex justify-center mb-4">
            <AnimatedHeritageLogo size="sm" isActive variant="login" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-heritage-gold animate-pulse" />
            <h2 className="text-2xl font-bold text-foreground">Welcome to Heritage!</h2>
            <Sparkles className="w-5 h-5 text-heritage-gold animate-pulse" />
          </div>
          <p className="text-muted-foreground">
            Hello <span className="font-semibold text-foreground">{userName}</span>, your account is now active.
          </p>
        </div>

        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Here's what you can do with First Heritage Bank of America:
          </p>

          <div className="space-y-3">
            {features.map((feature, i) => (
              <div 
                key={feature.title}
                className={`flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 transition-all duration-500 ${
                  step >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-9 h-9 rounded-full bg-heritage-gold/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-4 h-4 text-heritage-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 space-y-2">
            <Button 
              onClick={() => { onDismiss(); navigate('/dashboard/idme'); }} 
              className="w-full bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-blue font-semibold"
            >
              <Shield className="w-4 h-4 mr-2" />
              Complete ID Verification
            </Button>
            <Button 
              onClick={onDismiss}
              variant="outline" 
              className="w-full"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-xs text-muted-foreground">
              Fraud protection active • FDIC Insured
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
