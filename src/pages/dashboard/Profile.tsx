import { useEffect } from "react";
import { UserAccountProfile } from "@/components/UserAccountProfile";

export default function Profile() {
  useEffect(() => {
    document.title = "Heritage Bank - My Profile";
  }, []);

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">My Profile</h1>
        <p className="text-muted-foreground">View your accounts, cards, and personal information</p>
      </div>
      <UserAccountProfile />
    </main>
  );
}
