import { useEffect } from "react";
import { AccountStatements } from "@/components/AccountStatements";

export default function History() {
  useEffect(() => {
    document.title = "Heritage Bank - History";
  }, []);

  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="sr-only">Transaction History</h1>
      <AccountStatements />
    </main>
  );
}
