import { useEffect } from "react";
import { AccountTopUp } from "@/components/AccountTopUp";

export default function TopUp() {
  useEffect(() => {
    document.title = "Heritage Bank - Top Up";
  }, []);

  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="sr-only">Top Up</h1>
      <AccountTopUp />
    </main>
  );
}
