"use client";

import { ConnectButton } from "thirdweb/react";
import { client } from "@/lib/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import { useNetwork } from "@/lib/NetworkContext";
import { NetworkSwitcher } from "./NetworkSwitcher";
import { DollarSignIcon, InfoIcon, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";

export const Navbar = () => {
  const account = useActiveAccount();
  const pathname = usePathname();
  const { activeChain } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  // Helper function to determine nav item variants
  const getNavItemVariant = (path: string) => {
    if (path.startsWith('/dashboard')) {
      return pathname.startsWith('/dashboard') ? "default" : "ghost";
    }
    return pathname === path ? "default" : "ghost";
  };

  // Close mobile menu when a link is clicked
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center mr-6">
              <span className="text-xl font-bold">CryptoCrowd</span>
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1">
              <Button
                asChild
                variant={getNavItemVariant("/campaigns")}
                size="sm"
                className="h-9"
              >
                <Link href="/campaigns">All Campaigns</Link>
              </Button>
              {account && (
                <>
                  <Button
                    asChild
                    variant={getNavItemVariant(`/dashboard/${account.address}`)}
                    size="sm"
                    className="h-9"
                  >
                    <Link href={`/dashboard/${account.address}`}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant={getNavItemVariant("/my-donations")}
                    size="sm"
                    className="h-9"
                  >
                    <Link href="/my-donations">My Donations</Link>
                  </Button>
                </>
              )}
              <Button
                asChild
                variant={getNavItemVariant("/create")}
                size="sm"
                className="h-9"
              >
                <Link href="/create">Create</Link>
              </Button>
              <Button
                asChild
                variant={getNavItemVariant("/about-us")}
                size="sm"
                className={cn(
                  "h-9 flex items-center gap-1",
                  pathname === "/about-us" ? "bg-primary text-primary-foreground" : ""
                )}
              >
                <Link href="/about-us">
                  <InfoIcon className="w-4 h-4 mr-1" />
                  About Us
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Right side elements */}
          <div className="flex items-center space-x-2">
            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 py-4">
                  <Button
                    asChild
                    variant={getNavItemVariant("/campaigns")}
                    size="sm"
                    className="h-9 justify-start"
                    onClick={handleLinkClick}
                  >
                    <Link href="/campaigns">All Campaigns</Link>
                  </Button>
                  {account && (
                    <>
                      <Button
                        asChild
                        variant={getNavItemVariant(`/dashboard/${account.address}`)}
                        size="sm"
                        className="h-9 justify-start"
                        onClick={handleLinkClick}
                      >
                        <Link href={`/dashboard/${account.address}`}>
                          Dashboard
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant={getNavItemVariant("/my-donations")}
                        size="sm"
                        className="h-9 justify-start"
                        onClick={handleLinkClick}
                      >
                        <Link href="/my-donations">My Donations</Link>
                      </Button>
                    </>
                  )}
                  <Button
                    asChild
                    variant={getNavItemVariant("/create")}
                    size="sm"
                    className="h-9 justify-start"
                    onClick={handleLinkClick}
                  >
                    <Link href="/create">Create</Link>
                  </Button>
                  <Button
                    asChild
                    variant={getNavItemVariant("/about-us")}
                    size="sm"
                    className={cn(
                      "h-9 justify-start flex items-center gap-1",
                      pathname === "/about-us" ? "bg-primary text-primary-foreground" : ""
                    )}
                    onClick={handleLinkClick}
                  >
                    <Link href="/about-us">
                      <InfoIcon className="w-4 h-4 mr-1" />
                      About Us
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-9 justify-start"
                    onClick={handleLinkClick}
                  >
                    <Link href="/currency-converter">
                      <DollarSignIcon className="h-4 w-4 mr-2" />
                      Currency Converter
                    </Link>
                  </Button>
                  
                  <div className="pt-4 mt-4 border-t">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Theme</span>
                        <ModeToggle />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Network</span>
                        <NetworkSwitcher />
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Desktop-only elements */}
            <div className="hidden md:flex items-center space-x-2">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className={cn(
                  "relative group h-9 w-9",
                  pathname === "/currency-converter" ? "bg-primary/10" : ""
                )}
                aria-label="Currency Converter"
              >
                <Link href="/currency-converter">
                  <DollarSignIcon className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Currency Converter</span>
                  <span className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 w-max px-2 py-1 bg-background border rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Currency Converter
                  </span>
                </Link>
              </Button>
              <ModeToggle />
              <NetworkSwitcher />
            </div>
            
            {/* Always visible elements */}
            <div className="ml-1 max-w-[120px] sm:max-w-none">
              <ConnectButton
                client={client}
                connectModal={{
                  size: "wide",
                  showThirdwebBranding: true,
                }}
                theme={theme as "light" | "dark"}
                chain={activeChain}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
