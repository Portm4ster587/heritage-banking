import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { BillPayments } from "@/components/BillPayments";
import { HeritageLoadingScreen } from "@/components/HeritageLoadingScreen";

export default function Bills() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "First Heritage Bank of America - Bill Payments";
    // small delay for loading screen
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <HeritageLoadingScreen message="Loading bill payments..." />;

  return (
    <main className="container mx-auto px-6 py-8">
      <BackButton to="/dashboard" label="Back to Dashboard" className="mb-4" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Bill Payments</h1>
        <p className="text-muted-foreground">Manage your payees, schedule payments, and view payment history</p>
      </div>
      <BillPayments />
    </main>
  );
}
