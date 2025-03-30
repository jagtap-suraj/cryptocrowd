"use client";

import { ConnectButton } from "thirdweb/react";
import { client } from "@/lib/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";

export const Navbar = () => {
  const account = useActiveAccount();
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">CryptoCrowd</span>
            </Link>
            <div className="hidden md:flex space-x-4">
              <Button
                asChild
                variant={pathname === "/" ? "secondary" : "ghost"}
              >
                <Link href="/">Explore</Link>
              </Button>
              {account && (
                <Button
                  asChild
                  variant={
                    pathname.startsWith("/dashboard") ? "secondary" : "ghost"
                  }
                >
                  <Link href={`/dashboard/${account.address}`}>Dashboard</Link>
                </Button>
              )}
              <Button
                asChild
                variant={pathname === "/create" ? "secondary" : "ghost"}
              >
                <Link href="/create">Create</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <ConnectButton
              client={client}
              connectModal={{ size: "wide" }}
              theme="dark"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};
