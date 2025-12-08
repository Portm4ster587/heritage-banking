import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { HeritageLoadingScreen } from "@/components/HeritageLoadingScreen";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ModernDashboard from "./pages/ModernDashboard";
import NotFound from "./pages/NotFound";
import Transfers from "./pages/dashboard/Transfers";
import TopUp from "./pages/dashboard/TopUp";
import Crypto from "./pages/dashboard/Crypto";
import Settings from "./pages/dashboard/Settings";
import IDMe from "./pages/dashboard/IDMe";
import History from "./pages/dashboard/History";
import TransactionHistory from "./pages/dashboard/TransactionHistory";
import Withdraw from "./pages/dashboard/Withdraw";
import About from "./pages/About";
import Contact from "./pages/Contact";
import OpenAccount from "./pages/OpenAccount";
import LinkExternalBank from "./pages/LinkExternalBank";
import ConnectExternalBank from "./pages/ConnectExternalBank";
import AdminLogin from "./pages/AdminLogin";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <HeritageLoadingScreen message="Loading..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <HeritageLoadingScreen message="Loading..." />;
  }

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route 
              path="/auth" 
              element={
                <AuthRoute>
                  <Auth />
                </AuthRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <ModernDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard-old" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Dashboard sub-routes */}
            <Route 
              path="/dashboard/transfers" 
              element={
                <ProtectedRoute>
                  <Transfers />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/dashboard/topup" 
              element={
                <ProtectedRoute>
                  <TopUp />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/dashboard/crypto" 
              element={
                <ProtectedRoute>
                  <Crypto />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/dashboard/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/dashboard/idme" 
              element={
                <ProtectedRoute>
                  <IDMe />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/dashboard/withdraw" 
              element={
                <ProtectedRoute>
                  <Withdraw />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/dashboard/history" 
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/dashboard/transactions" 
              element={
                <ProtectedRoute>
                  <TransactionHistory />
                </ProtectedRoute>
              }
            />

            {/* Public Routes */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/open-account" element={<OpenAccount />} />
            <Route 
              path="/admin" 
              element={
                <AuthRoute>
                  <AdminLogin />
                </AuthRoute>
              }
            />
            
            {/* Protected Account Routes */}
            <Route 
              path="/link-external-bank" 
              element={
                <ProtectedRoute>
                  <LinkExternalBank />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/link-external-bank/connect" 
              element={
                <ProtectedRoute>
                  <ConnectExternalBank />
                </ProtectedRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
