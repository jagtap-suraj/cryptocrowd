import { Button } from "./ui/button";
import Link from "next/link";
import { InfoIcon } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary/10 to-muted/20 py-20 sm:py-24">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Fund the Future with{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              CryptoCrowd
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The decentralized platform where creators meet backers to bring
            innovative ideas to life.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Button 
              asChild 
              size="lg" 
              className="rounded-full px-8 w-full sm:w-auto transition-all hover:scale-105 duration-200"
            >
              <Link href="/campaigns">Explore Campaigns</Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="rounded-full px-8 w-full sm:w-auto transition-all hover:bg-primary/10 duration-200"
            >
              <Link href="/create">Start a Campaign</Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="ghost" 
              className="rounded-full px-6 w-full sm:w-auto flex items-center justify-center gap-2 transition-all hover:bg-primary/5 duration-200"
            >
              <Link href="/about-us">
                <InfoIcon className="w-5 h-5" />
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
