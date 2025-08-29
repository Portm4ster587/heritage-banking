import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle, Clock, AlertTriangle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  required: boolean;
}

const verificationSteps: VerificationStep[] = [
  {
    id: 'identity',
    title: 'Identity Verification',
    description: 'Verify your identity with government-issued ID',
    status: 'pending',
    required: true
  },
  {
    id: 'address',
    title: 'Address Verification', 
    description: 'Confirm your residential address',
    status: 'pending',
    required: true
  },
  {
    id: 'phone',
    title: 'Phone Verification',
    description: 'Verify your phone number via SMS',
    status: 'pending',
    required: true
  },
  {
    id: 'income',
    title: 'Income Verification',
    description: 'Verify your income and employment status',
    status: 'pending',
    required: false
  }
];

export const IDMeVerification = () => {
  const [steps, setSteps] = useState<VerificationStep[]>(verificationSteps);
  const [overallProgress, setOverallProgress] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<'not_started' | 'in_progress' | 'completed' | 'failed'>('not_started');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const totalRequiredSteps = steps.filter(step => step.required).length;
    const progress = (completedSteps / steps.length) * 100;
    setOverallProgress(progress);

    const completedRequiredSteps = steps.filter(step => step.required && step.status === 'completed').length;
    if (completedRequiredSteps === totalRequiredSteps) {
      setVerificationStatus('completed');
    } else if (completedSteps > 0) {
      setVerificationStatus('in_progress');
    }
  }, [steps]);

  const handleStartVerification = () => {
    toast({
      title: "Verification Started",
      description: "Redirecting to ID.me for secure identity verification...",
    });

    // Simulate ID.me redirect and verification process
    setTimeout(() => {
      setSteps(prev => prev.map(step => 
        step.id === 'identity' 
          ? { ...step, status: 'in_progress' } 
          : step
      ));

      // Simulate completion of verification steps
      setTimeout(() => {
        setSteps(prev => prev.map(step => {
          if (step.id === 'identity') return { ...step, status: 'completed' };
          if (step.id === 'phone') return { ...step, status: 'completed' };
          if (step.id === 'address') return { ...step, status: 'in_progress' };
          return step;
        }));

        setTimeout(() => {
          setSteps(prev => prev.map(step => 
            step.id === 'address' 
              ? { ...step, status: 'completed' } 
              : step
          ));
        }, 2000);
      }, 3000);
    }, 1000);
  };

  const handleCompleteStep = (stepId: string) => {
    setSteps(prev => prev.map(step =>
      step.id === stepId 
        ? { ...step, status: 'completed' }
        : step
    ));

    toast({
      title: "Step Completed",
      description: `${steps.find(s => s.id === stepId)?.title} verification completed successfully`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-warning animate-pulse" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'in_progress':
        return 'bg-warning text-warning-foreground';
      case 'failed':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="animate-slide-up">
        <h2 className="text-3xl font-bold text-primary mb-2">ID.me Identity Verification</h2>
        <p className="text-muted-foreground">Secure and trusted identity verification powered by ID.me</p>
      </div>

      {/* Verification Overview */}
      <Card className="banking-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span>Verification Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Badge className={getStatusColor(verificationStatus === 'completed' ? 'completed' : verificationStatus === 'in_progress' ? 'in_progress' : 'pending')}>
                {verificationStatus === 'completed' ? 'Verified' : 
                 verificationStatus === 'in_progress' ? 'In Progress' : 'Not Started'}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-primary mb-2">{overallProgress.toFixed(0)}% Complete</p>
            <Progress value={overallProgress} className="mb-4" />
            <p className="text-sm text-muted-foreground">
              Complete your verification to unlock all Heritage Bank features
            </p>
          </div>

          {verificationStatus === 'not_started' && (
            <div className="text-center space-y-4">
              <div className="p-6 border-2 border-dashed border-primary/20 rounded-lg">
                <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Secure Verification with ID.me</h3>
                <p className="text-muted-foreground mb-4">
                  ID.me is a trusted digital identity platform used by major financial institutions
                  to verify customer identities safely and securely.
                </p>
                <Button onClick={handleStartVerification} className="banking-button">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Start Verification with ID.me
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Steps */}
      <Card className="banking-card">
        <CardHeader>
          <CardTitle>Verification Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{step.title}</h4>
                      {step.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(step.status)}>
                    {step.status.replace('_', ' ')}
                  </Badge>
                  {step.status === 'pending' && verificationStatus === 'in_progress' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCompleteStep(step.id)}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits of Verification */}
      <Card className="banking-card">
        <CardHeader>
          <CardTitle>Benefits of Completing Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <h4 className="font-medium">Higher Account Limits</h4>
                <p className="text-sm text-muted-foreground">Unlock higher transaction and credit limits</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <h4 className="font-medium">Premium Card Access</h4>
                <p className="text-sm text-muted-foreground">Access to Heritage premium credit cards</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <h4 className="font-medium">Investment Services</h4>
                <p className="text-sm text-muted-foreground">Access to investment and wealth management</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <h4 className="font-medium">Priority Support</h4>
                <p className="text-sm text-muted-foreground">24/7 priority customer support</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card className="banking-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span>Security & Privacy</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-medium text-primary mb-2">Why ID.me?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Trusted by 500+ companies including government agencies</li>
                <li>• Bank-level security and encryption</li>
                <li>• Your data is never sold or shared without consent</li>
                <li>• Compliant with federal privacy regulations</li>
              </ul>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Your personal information is protected with enterprise-grade security</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};