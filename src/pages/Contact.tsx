import { AnimatedHeritageLogo } from "@/components/AnimatedHeritageLogo";

const Contact = () => {
  const states = [
    'Ohio (Head Office)', 'Michigan', 'Indiana', 'Pennsylvania', 'Kentucky', 'West Virginia',
    'Illinois', 'Wisconsin', 'Tennessee', 'Virginia', 'Maryland', 'New York', 'New Jersey',
    'North Carolina', 'South Carolina'
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container mx-auto px-6 py-16">
        <div className="flex items-center gap-4 mb-8">
          <AnimatedHeritageLogo size="sm" />
          <h1 className="text-3xl font-bold">Contact Us</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl border bg-card">
            <h2 className="font-semibold mb-3">Head Office</h2>
            <p className="text-sm text-muted-foreground">Columbus, Ohio</p>
            <p className="text-sm text-muted-foreground">Support: support@heritagebank.example</p>
            <p className="text-sm text-muted-foreground">Phone: (614) 555-0199</p>
          </div>
          <div className="p-6 rounded-xl border bg-card">
            <h2 className="font-semibold mb-3">ATM Locations (Nearby States)</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              {states.map((s) => (
                <li key={s} className="list-disc list-inside">{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
