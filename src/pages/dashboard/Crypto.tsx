import { useEffect } from "react";
import { CryptoWallet } from "@/components/CryptoWallet";

export default function Crypto() {
  useEffect(() => {
    document.title = "Heritage Bank - Crypto";
  }, []);

  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="sr-only">Crypto</h1>
      <CryptoWallet />
    </main>
  );
}
