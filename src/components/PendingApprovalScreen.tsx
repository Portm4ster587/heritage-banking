import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Shield, CheckCircle, Mail, Phone, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedHeritageLogo } from '@/components/AnimatedHeritageLogo';

interface PendingApprovalScreenProps {
  applicantName?: string;
  applicationNumber?: string;
  email?: string;
}

export const PendingApprovalScreen = ({ applicantName, applicationNumber, email }: PendingApprovalScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-heritage-blue via-heritage-blue-dark to-primary flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-card/95 backdrop-blur-xl shadow-2xl border-heritage-gold/20">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="flex justify-center">
            <AnimatedHeritageLogo size="md" isActive variant="login" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Application Submitted!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-heritage-gold/10 flex items-center justify-center mx-auto animate-pulse">
            <Clock className="w-10 h-10 text-heritage-gold" />
          </div>

          <div>
            <p className="text-lg font-semibold text-foreground">
              Thank you{applicantName ? `, ${applicantName}` : ''}!
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              Your Heritage Bank account application is currently under review by our team.
              This typically takes 1-2 business days.
            </p>
          </div>

          {applicationNumber && (
            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground">Application Reference</p>
              <p className="font-mono font-bold text-foreground">{applicationNumber}</p>
            </div>
          )}

          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Shield className="w-5 h-5 text-heritage-gold mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Identity Verification</p>
                <p className="text-xs text-muted-foreground">Your documents are being securely reviewed</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Mail className="w-5 h-5 text-heritage-gold mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Email Notification</p>
                <p className="text-xs text-muted-foreground">
                  We'll email {email || 'you'} once your account is approved
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Phone className="w-5 h-5 text-heritage-gold mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">SMS Updates</p>
                <p className="text-xs text-muted-foreground">You'll receive SMS alerts about your application status</p>
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <Link to="/auth">
              <Button className="w-full bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-blue font-semibold">
                <CheckCircle className="w-4 h-4 mr-2" />
                Sign In to Existing Account
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            Questions? Call <strong>1-800-HERITAGE</strong> or email support@heritagebank.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
