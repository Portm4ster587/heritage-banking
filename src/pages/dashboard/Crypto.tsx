import { useEffect } from "react";
import { CryptoWallet } from "@/components/CryptoWallet";
import { BackButton } from "@/components/BackButton";

export default function Crypto() {
  useEffect(() => {
    document.title = "Heritage Bank - Crypto";
  }, []);

  return (
    <main className="container mx-auto px-6 py-8">
      <BackButton to="/dashboard" label="Back to Dashboard" className="mb-4" />
      <h1 className="text-3xl font-bold text-primary mb-6">Heritage Crypto</h1>
      <CryptoWallet />
    </main>
  );
}
