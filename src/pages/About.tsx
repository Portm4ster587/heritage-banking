import { AnimatedHeritageLogo } from "@/components/AnimatedHeritageLogo";

const About = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container mx-auto px-6 py-16">
        <div className="flex items-center gap-4 mb-8">
          <AnimatedHeritageLogo size="sm" />
          <h1 className="text-3xl font-bold">About Heritage Bank</h1>
        </div>
        <p className="text-muted-foreground max-w-3xl">
          Heritage Bank is a modern American financial institution delivering trusted services since 1892. 
          Our head office is proudly located in Ohio, serving customers across the United States with secure, 
          technology-forward experiences and premium customer care.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="p-6 rounded-xl border bg-card">
            <h2 className="font-semibold mb-2">Head Office</h2>
            <p className="text-sm text-muted-foreground">Columbus, Ohio</p>
          </div>
          <div className="p-6 rounded-xl border bg-card">
            <h2 className="font-semibold mb-2">Mission</h2>
            <p className="text-sm text-muted-foreground">Secure, simple, and human banking for every customer.</p>
          </div>
          <div className="p-6 rounded-xl border bg-card">
            <h2 className="font-semibold mb-2">Values</h2>
            <p className="text-sm text-muted-foreground">Integrity, innovation, and excellence.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
