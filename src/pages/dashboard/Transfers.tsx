import { useEffect } from "react";
import { TransferSystem } from "@/components/TransferSystem";

export default function Transfers() {
  useEffect(() => {
    document.title = "Heritage Bank - Transfers";
  }, []);

  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="sr-only">Transfers</h1>
      <TransferSystem />
    </main>
  );
}
