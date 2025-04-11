"use client";

import { useNetwork, NetworkType, NETWORKS } from "@/lib/NetworkContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function NetworkSwitcher() {
  const { network, setNetwork } = useNetwork();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 flex items-center gap-1"
        >
          <Globe className="h-4 w-4" />
          <span>{NETWORKS[network].name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Select Network</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(NETWORKS) as NetworkType[]).map((networkKey) => (
          <DropdownMenuItem
            key={networkKey}
            className={
              network === networkKey
                ? "bg-accent text-accent-foreground font-medium"
                : ""
            }
            onClick={() => setNetwork(networkKey)}
          >
            {NETWORKS[networkKey].name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 