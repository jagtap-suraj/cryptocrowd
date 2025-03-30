import { Button } from "./ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary/10 to-muted/20 py-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Fund the Future with{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              CryptoCrowd
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            The decentralized platform where creators meet backers to bring
            innovative ideas to life.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/create">Start a Campaign</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/campaigns">Explore Projects</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
