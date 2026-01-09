import { useEffect } from "react";
import { AccountStatements } from "@/components/AccountStatements";
import { BackButton } from "@/components/BackButton";

export default function History() {
  useEffect(() => {
    document.title = "Heritage Bank - Transaction History";
  }, []);

  return (
    <main className="container mx-auto px-6 py-8">
      <BackButton to="/dashboard" label="Back to Dashboard" className="mb-4" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Transaction History</h1>
        <p className="text-muted-foreground">View your account statements and transaction history</p>
      </div>
      <AccountStatements />
    </main>
  );
}
