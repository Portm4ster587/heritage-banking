import { useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { FullAdminPanel } from "@/components/admin/FullAdminPanel";
import { HeritageLoadingScreen } from "@/components/HeritageLoadingScreen";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    document.title = "Heritage Bank - Admin Dashboard";
  }, []);

  if (loading) {
    return <HeritageLoadingScreen message="Loading admin dashboard..." />;
  }

  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-10 max-w-3xl">
          <h1 className="text-2xl font-semibold">Access denied</h1>
          <p className="text-muted-foreground mt-2">
            This account does not have administrator privileges.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
            <Link to="/admin-login">
              <Button variant="outline">Try another admin login</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <FullAdminPanel />;
}
