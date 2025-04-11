import { CampaignGrid } from "@/components/CampaignGrid";
import { FeatureCards } from "@/components/FeatureCards";
import { HeroSection } from "@/components/HeroSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />

      <section className="py-16 bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center opacity-30"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Choose CryptoCrowd
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools you need to fund your projects securely on the blockchain
            </p>
          </div>
          <FeatureCards />
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Featured Campaigns
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Discover innovative projects on the blockchain
            </p>
          </div>
          <CampaignGrid limit={3} />
          <div className="mt-12 flex justify-center">
            <Button asChild size="lg" className="rounded-full px-8 hover:scale-105 transition-all duration-200">
              <Link href="/campaigns">View All Campaigns</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
