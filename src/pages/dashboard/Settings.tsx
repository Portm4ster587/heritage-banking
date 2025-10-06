import { useEffect } from "react";
import { AccountSettings } from "@/components/AccountSettings";

export default function Settings() {
  useEffect(() => {
    document.title = "Heritage Bank - Settings";
  }, []);

  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="sr-only">Account Settings</h1>
      <AccountSettings />
    </main>
  );
}
