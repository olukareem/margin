import { Footer } from "./_components/footer";
import { Heading } from "./_components/heading";
import { Heroes } from "./_components/heroes";

// Root layout mounts ClerkProvider, which validates env-sourced keys at render time.
// Rendering the marketing page dynamically keeps the build from requiring keys.
export const dynamic = "force-dynamic";

const MarketingPage = () => {
  return (
    <div className="min-h-full flex flex-col bg-background">
      <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-12 flex-1 px-6 pt-32 pb-16">
        <Heading />
        <Heroes />
      </div>
      <Footer />
    </div>
  );
};

export default MarketingPage;
