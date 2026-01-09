import { useEffect } from "react";
import { AccountSettings } from "@/components/AccountSettings";
import { BackButton } from "@/components/BackButton";

export default function Settings() {
  useEffect(() => {
    document.title = "Heritage Bank - Account Settings";
  }, []);

  return (
    <main className="container mx-auto px-6 py-8">
      <BackButton to="/dashboard" label="Back to Dashboard" className="mb-4" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and security settings</p>
      </div>
      <AccountSettings />
    </main>
  );
}
