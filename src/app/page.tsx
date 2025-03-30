import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HeroSection } from "@/components/HeroSection";
import { FeatureCards } from "@/components/FeatureCards";
import { CampaignGrid } from "@/components/CampaignGrid";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <FeatureCards />
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Featured Campaigns
            </h2>
            <p className="mt-4 text-muted-foreground">
              Discover innovative projects on the blockchain
            </p>
          </div>
          <CampaignGrid limit={3} />
          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/campaigns">View All Campaigns</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
