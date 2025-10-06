import { useEffect } from "react";
import { IDMeVerification } from "@/components/IDMeVerification";

export default function IDMe() {
  useEffect(() => {
    document.title = "Heritage Bank - ID.me";
  }, []);

  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="sr-only">ID.me Verification</h1>
      <IDMeVerification />
    </main>
  );
}
