import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { signIn, signUp } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Shield, CreditCard, Banknote, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { HeritageLogoAnimation } from './HeritageLogoAnimation';
import { cn } from '@/lib/utils';

export default function EnhancedAuthFlow() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [currentTab, setCurrentTab] = useState('signin');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [validationState, setValidationState] = useState({
    email: false,
    password: false,
    passwordMatch: false,
    names: false
  });

  useEffect(() => {
    setValidationState({
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      password: password.length >= 8,
      passwordMatch: password === confirmPassword && password.length > 0,
      names: firstName.trim().length > 0 && lastName.trim().length > 0
    });
  }, [email, password, confirmPassword, firstName, lastName]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Authentication Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setAuthSuccess(true);
        toast({
          title: "Welcome Back!",
          description: "Successfully authenticated to your Heritage account.",
          duration: 2000
        });
        
        // Delay navigation for animation
        setTimeout(() => {
          navigate('/dashboard');
        }, 2500);
      }
    } catch (error) {
      toast({
        title: "System Error",
        description: "An unexpected error occurred during authentication.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Please ensure both password fields match.",
        variant: "destructive"
      });
      return;
    }

    if (!validationState.names) {
      toast({
        title: "Missing Information",
        description: "Please provide your complete name.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await signUp(email, password);
      
      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        });
      } else if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email
        });

        setAuthSuccess(true);
        toast({
          title: "Account Created Successfully!",
          description: "Welcome to Heritage Banking. Please verify your email.",
          duration: 3000
        });
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 3500);
      }
    } catch (error) {
      toast({
        title: "Registration Error",
        description: "Failed to create your account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-all duration-300 hover:scale-105">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-12 items-center min-h-[calc(100vh-12rem)]">
          {/* Left side - Enhanced Branding */}
          <div className="flex-1 space-y-8 animate-fade-in">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <HeritageLogoAnimation 
                  isActive={loading || authSuccess}
                  size="lg"
                  variant={authSuccess ? 'success' : 'login'}
                />
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    Heritage Banking
                  </h1>
                  <p className="text-lg text-primary/80 font-medium">Professional • Secure • Modern</p>
                </div>
              </div>
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Experience premium banking with enterprise-grade security, intelligent features, and sophisticated design.
              </p>
            </div>
            
            <div className="grid gap-6 max-w-md">
              <div className={cn(
                "flex items-center gap-4 p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 transition-all duration-300",
                "hover:shadow-lg hover:scale-105 hover:bg-card"
              )}>
                <div className="p-3 rounded-xl bg-primary/10 ring-2 ring-primary/20">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Military-Grade Security</h3>
                  <p className="text-sm text-muted-foreground">Advanced encryption & multi-factor authentication</p>
                </div>
              </div>
              
              <div className={cn(
                "flex items-center gap-4 p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 transition-all duration-300",
                "hover:shadow-lg hover:scale-105 hover:bg-card"
              )}>
                <div className="p-3 rounded-xl bg-secondary/10 ring-2 ring-secondary/20">
                  <CreditCard className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Instant Approvals</h3>
                  <p className="text-sm text-muted-foreground">AI-powered decisions in under 60 seconds</p>
                </div>
              </div>
              
              <div className={cn(
                "flex items-center gap-4 p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 transition-all duration-300",
                "hover:shadow-lg hover:scale-105 hover:bg-card"
              )}>
                <div className="p-3 rounded-xl bg-accent/10 ring-2 ring-accent/20">
                  <Banknote className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Zero Transfer Fees</h3>
                  <p className="text-sm text-muted-foreground">Free transfers worldwide, 24/7 support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Enhanced Auth Form */}
          <div className="w-full max-w-md animate-slide-up">
            <Card className="border-border/50 bg-card/90 backdrop-blur-xl shadow-2xl ring-1 ring-border/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              
              <CardHeader className="relative">
                <CardTitle className="text-center text-2xl font-bold">
                  {authSuccess ? 'Welcome!' : 'Secure Access'}
                </CardTitle>
                <CardDescription className="text-center text-base">
                  {authSuccess ? 'Authentication successful' : 'Sign in to your account or create a new one'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative">
                {authSuccess ? (
                  <div className="text-center py-8 space-y-4">
                    <HeritageLogoAnimation isActive size="lg" variant="success" />
                    <div className="space-y-2">
                      <CheckCircle className="w-12 h-12 text-success mx-auto animate-scale-in" />
                      <p className="text-success font-semibold">Authentication Complete</p>
                      <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
                    </div>
                  </div>
                ) : (
                  <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="signin" className="transition-all duration-200">Sign In</TabsTrigger>
                      <TabsTrigger value="signup" className="transition-all duration-200">Sign Up</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="signin" className="space-y-0">
                      <form onSubmit={handleSignIn} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="signin-email" className="text-sm font-medium">Email Address</Label>
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={cn(
                              "transition-all duration-200 focus:ring-2 focus:ring-primary/20 h-12",
                              validationState.email && email && "ring-2 ring-success/20 border-success"
                            )}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                          <div className="relative">
                            <Input
                              id="signin-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your secure password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              className={cn(
                                "transition-all duration-200 focus:ring-2 focus:ring-primary/20 h-12 pr-12",
                                validationState.password && password && "ring-2 ring-success/20 border-success"
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full h-12 text-base font-semibold banking-button" 
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="flex items-center gap-3">
                              <HeritageLogoAnimation isActive size="sm" variant="login" className="scale-75" />
                              <span>Authenticating...</span>
                            </div>
                          ) : (
                            'Sign In'
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="signup" className="space-y-0">
                      <form onSubmit={handleSignUp} className="space-y-6">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="first-name" className="text-sm font-medium">First Name</Label>
                            <Input
                              id="first-name"
                              type="text"
                              placeholder="John"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              required
                              className={cn(
                                "transition-all duration-200 focus:ring-2 focus:ring-primary/20 h-12",
                                firstName.trim() && "ring-2 ring-success/20 border-success"
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="last-name" className="text-sm font-medium">Last Name</Label>
                            <Input
                              id="last-name"
                              type="text"
                              placeholder="Doe"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              required
                              className={cn(
                                "transition-all duration-200 focus:ring-2 focus:ring-primary/20 h-12",
                                lastName.trim() && "ring-2 ring-success/20 border-success"
                              )}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-sm font-medium">Email Address</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={cn(
                              "transition-all duration-200 focus:ring-2 focus:ring-primary/20 h-12",
                              validationState.email && "ring-2 ring-success/20 border-success"
                            )}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                          <div className="relative">
                            <Input
                              id="signup-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a strong password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              className={cn(
                                "transition-all duration-200 focus:ring-2 focus:ring-primary/20 h-12 pr-12",
                                validationState.password && "ring-2 ring-success/20 border-success"
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Minimum 8 characters required
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
                          <div className="relative">
                            <Input
                              id="confirm-password"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                              className={cn(
                                "transition-all duration-200 focus:ring-2 focus:ring-primary/20 h-12 pr-12",
                                validationState.passwordMatch && "ring-2 ring-success/20 border-success",
                                confirmPassword && !validationState.passwordMatch && "ring-2 ring-destructive/20 border-destructive"
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full h-12 text-base font-semibold banking-button" 
                          disabled={loading || !validationState.email || !validationState.password || !validationState.passwordMatch || !validationState.names}
                        >
                          {loading ? (
                            <div className="flex items-center gap-3">
                              <HeritageLogoAnimation isActive size="sm" variant="login" className="scale-75" />
                              <span>Creating Account...</span>
                            </div>
                          ) : (
                            'Create Heritage Account'
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}