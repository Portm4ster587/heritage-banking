import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { signIn } from '@/lib/auth';
import { AnimatedHeritageLogo } from '@/components/AnimatedHeritageLogo';
import { Loader2, Shield, ArrowLeft, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalized = username.trim().toLowerCase();
      const normalizedPassword = password.trim();

      // Validate admin credentials
      if (normalized !== 'admin') {
        toast({
          title: "Access Denied",
          description: "Invalid administrator credentials. Only authorized personnel can access this portal.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const { data, error } = await signIn(normalized, normalizedPassword);
      
      if (error) {
        toast({
          title: "Authentication Failed",
          description: "Invalid administrator credentials. Please verify your login details.",
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        setShowSuccess(true);
        setTimeout(() => {
          toast({
            title: "Admin Access Granted",
            description: "Welcome to Heritage Bank Administration Portal."
          });
          navigate('/dashboard', { state: { section: 'admin' } });
        }, 2000);
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Authentication Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0d1b2a] via-[#1e3a5f] to-[#0d1b2a]">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)',
            top: '10%',
            left: '10%',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
            bottom: '20%',
            right: '10%',
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link to="/">
          <Button variant="ghost" className="text-white hover:bg-white/10 backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="relative flex items-center justify-center min-h-screen py-8 px-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-md shadow-2xl border-0">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <div className="relative">
                <AnimatedHeritageLogo 
                  size="lg" 
                  isActive={true} 
                  variant={showSuccess ? "success" : "login"}
                />
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-heritage-gold rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 text-heritage-blue" />
                </div>
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-heritage-blue">Admin Portal</CardTitle>
              <CardDescription className="text-heritage-blue/70">
                Heritage Bank Administration System
              </CardDescription>
            </div>
          </CardHeader>
          
          {!showSuccess ? (
            <CardContent>
              <form onSubmit={handleAdminLogin} className="space-y-6">
                {/* Security Notice */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Restricted Access</p>
                      <p className="text-xs text-red-600 mt-1">
                        This portal is for authorized Heritage Bank administrators only. 
                        All access attempts are logged and monitored.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-username" className="text-heritage-blue font-medium">
                      Administrator Username
                    </Label>
                    <Input
                      id="admin-username"
                      type="text"
                      placeholder="Enter admin username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="border-heritage-blue/20 focus:border-heritage-gold focus:ring-heritage-gold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-heritage-blue font-medium">
                      Password
                    </Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-heritage-blue/20 focus:border-heritage-gold focus:ring-heritage-gold"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-heritage-blue hover:bg-heritage-blue/90 text-heritage-gold font-semibold py-6 text-lg" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {loading ? 'Authenticating...' : 'Access Admin Portal'}
                </Button>

                {/* Demo Credentials */}
                <div className="bg-heritage-blue/5 border border-heritage-gold/20 rounded-md p-4 text-center">
                  <p className="text-xs text-heritage-blue/70 mb-1">
                    <strong>Admin:</strong> email: <code className="bg-heritage-gold/20 px-1 rounded">admin@heritagebank.com</code> / 
                    password: <code className="bg-heritage-gold/20 px-1 rounded">00009999</code>
                  </p>
                  <p className="text-[10px] text-heritage-blue/50">Or login with username: admin</p>
                </div>
              </form>

              {/* User Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Not an administrator?{' '}
                  <Link to="/auth" className="text-heritage-blue hover:text-heritage-gold font-medium">
                    User Login
                  </Link>
                </p>
              </div>
            </CardContent>
          ) : (
            <CardContent className="text-center py-8">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-600">Access Granted</h3>
                <p className="text-sm text-muted-foreground">
                  Redirecting to admin dashboard...
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
