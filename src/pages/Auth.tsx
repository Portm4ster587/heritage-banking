import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { signIn, signUp } from '@/lib/auth';
import { AnimatedHeritageLogo } from '@/components/AnimatedHeritageLogo';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import heritageBg1 from '@/assets/heritage-bg-1.jpg';
import heritageBg2 from '@/assets/heritage-bg-2.jpg';
import heritageBg3 from '@/assets/heritage-bg-3.jpg';
import heritageHorses from '@/assets/heritage-horses.jpg';
import heritageFamily from '@/assets/heritage-family.jpg';
import bankInterior1 from '@/assets/bank-interior-1.jpg';
import bankInterior2 from '@/assets/bank-interior-2.jpg';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const backgroundImages = [
    heritageBg1, 
    heritageBg2, 
    heritageBg3, 
    heritageHorses, 
    heritageFamily,
    bankInterior1,
    bankInterior2
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 3000); // Faster transitions for more images
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();
      const { data, error } = await signIn(normalizedEmail, normalizedPassword);
      
      if (error) {
        let errorMessage = error.message;
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please check your credentials and try again, or sign up if you don't have an account yet.";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Please verify your email address before signing in. Check your inbox for the confirmation link.";
        } else if (error.message.includes('User not found')) {
          errorMessage = "No account found with this email. Please sign up first.";
        }
        
        toast({
          title: "Authentication Failed",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        setShowSuccess(true);
        setTimeout(() => {
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully."
          });
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign In Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate password strength
      if (password.length < 8) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 8 characters long.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();
      const { data, error } = await signUp(normalizedEmail, normalizedPassword);
      
      if (error) {
        let errorMessage = error.message;
        
        // Provide more specific error messages
        if (error.message.includes('already registered')) {
          errorMessage = "This email is already registered. Please sign in instead or use a different email.";
        } else if (error.message.includes('password')) {
          errorMessage = "Password must be at least 8 characters with a mix of letters, numbers, and symbols.";
        }
        
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Account Created Successfully!",
          description: "You can now sign in with your credentials. Note: Email confirmation may be required depending on settings.",
          duration: 5000
        });
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Slideshow - High Quality */}
      <div className="absolute inset-0">
        {backgroundImages.map((bg, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: currentBgIndex === index ? 1 : 0,
              imageRendering: 'crisp-edges',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
            }}
          />
        ))}
        {/* Lighter overlay for more background visibility */}
        <div className="absolute inset-0 bg-black/25" />
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link to="/">
          <Button variant="ghost" className="text-white hover:bg-white/20 backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="relative flex items-center justify-center min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
          <Card className="bg-white/90 backdrop-blur-md shadow-2xl border-0">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <AnimatedHeritageLogo 
                  size="lg" 
                  isActive={true} 
                  variant={showSuccess ? "success" : "login"}
                  onAnimationComplete={() => {
                    if (showSuccess) {
                      navigate('/dashboard');
                    }
                  }}
                />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-heritage-blue">Heritage Bank</CardTitle>
                <CardDescription className="text-heritage-blue/70">
                  Secure access to your premium banking experience
                </CardDescription>
              </div>
            </CardHeader>
            
            {!showSuccess && (
              <CardContent>
                <Tabs defaultValue="signin" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2 bg-heritage-blue/10">
                    <TabsTrigger value="signin" className="data-[state=active]:bg-heritage-gold data-[state=active]:text-heritage-blue">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-heritage-gold data-[state=active]:text-heritage-blue">
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-6">
                      <div className="bg-heritage-blue/5 border border-heritage-gold/20 rounded-md p-3 mb-4">
                        <p className="text-xs text-heritage-blue/70">
                          <strong>First time here?</strong> Please use the Sign Up tab to create your account first.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-heritage-blue font-medium">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border-heritage-blue/20 focus:border-heritage-gold focus:ring-heritage-gold"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-heritage-blue font-medium">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Your secure password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border-heritage-blue/20 focus:border-heritage-gold focus:ring-heritage-gold"
                            required
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-blue font-semibold py-3" 
                        disabled={loading}
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Signing In...' : 'Sign In'}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <div className="space-y-6">
                      <div className="bg-heritage-blue/5 border border-heritage-gold/20 rounded-md p-4">
                        <p className="text-sm text-heritage-blue/90 mb-3">
                          <strong>Open Your Heritage Account</strong>
                        </p>
                        <p className="text-xs text-heritage-blue/70 mb-3">
                          Complete our comprehensive American banking application with full KYC verification, 
                          security questions, and account setup.
                        </p>
                        <Link to="/open-account">
                          <Button className="w-full bg-heritage-blue hover:bg-heritage-blue-dark text-heritage-gold font-semibold">
                            Open New Account
                          </Button>
                        </Link>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-heritage-blue/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-heritage-blue/50">Or quick signup</span>
                        </div>
                      </div>

                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="signup-email" className="text-heritage-blue font-medium">Email Address</Label>
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="your@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="border-heritage-blue/20 focus:border-heritage-gold focus:ring-heritage-gold"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-password" className="text-heritage-blue font-medium">Password</Label>
                            <Input
                              id="signup-password"
                              type="password"
                              placeholder="Create a strong password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="border-heritage-blue/20 focus:border-heritage-gold focus:ring-heritage-gold"
                              required
                            />
                            <p className="text-xs text-heritage-blue/60">
                              Must be at least 8 characters
                            </p>
                          </div>
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-heritage-blue hover:bg-heritage-blue-dark text-heritage-gold font-semibold py-3" 
                          disabled={loading}
                        >
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {loading ? 'Creating Account...' : 'Quick Signup'}
                        </Button>
                        <p className="text-xs text-center text-heritage-blue/60">
                          Quick signup allows immediate access. Complete full application later.
                        </p>
                      </form>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}
            
            {showSuccess && (
              <CardContent className="text-center py-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-heritage-blue">Authentication Successful!</h3>
                  <p className="text-heritage-blue/70">Redirecting to your dashboard...</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;