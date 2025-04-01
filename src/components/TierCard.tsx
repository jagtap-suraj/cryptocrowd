"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useActiveAccount } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { getContract } from "thirdweb/contract";
import { baseSepolia } from "thirdweb/chains";
import { client } from "@/lib/client";
import Image from "next/image";
import { useSendTransaction } from "thirdweb/react";
import { toast } from "sonner";
import { formatEther } from "viem";

interface Tier {
  name: string;
  imageHash: string;
  amount: bigint;
  backers: bigint;
  benefits: string;
}

interface TierCardProps {
  tier: Tier;
  index: number;
  contractAddress: string;
  isOwner: boolean;
}

export function TierCard({
  tier,
  index,
  contractAddress,
  isOwner,
}: TierCardProps) {
  const account = useActiveAccount();
  const { mutate: fund, isPending: isFunding } = useSendTransaction();
  const { mutate: removeTier, isPending: isRemoving } = useSendTransaction();

  if (!contractAddress) {
    console.error("Contract address is required");
    return null;
  }

  const contract = getContract({
    client,
    chain: baseSepolia,
    address: contractAddress,
  });

  const fundTransaction = prepareContractCall({
    contract,
    method: "function fund(uint256) payable",
    params: [BigInt(index)],
    value: tier.amount,
  });

  const removeTierTransaction = prepareContractCall({
    contract,
    method: "function removeTier(uint256)",
    params: [BigInt(index)],
  });

  const handleFund = () => {
    fund(fundTransaction, {
      onSuccess: () => {
        toast.success("Successfully funded the tier!");
      },
      onError: (error) => {
        toast.error("Funding failed", {
          description: error.message,
        });
      },
    });
  };

  const handleRemoveTier = () => {
    removeTier(removeTierTransaction, {
      onSuccess: () => {
        toast.success("Tier removed successfully!");
      },
      onError: (error) => {
        toast.error("Failed to remove tier", {
          description: error.message,
        });
      },
    });
  };

  const getImageUrl = () => {
    if (!tier.imageHash) return "/placeholder-image.jpg";
    if (tier.imageHash.startsWith("http")) return tier.imageHash;
    if (tier.imageHash.startsWith("ipfs://")) {
      return `https://ipfs.io/ipfs/${tier.imageHash.replace("ipfs://", "")}`;
    }
    return `https://ipfs.io/ipfs/${tier.imageHash}`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="p-0">
        <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
          <Image
            src={getImageUrl()}
            alt={tier.name}
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold">{tier.name}</h3>
          <p className="font-bold">{formatEther(tier.amount)} ETH</p>
        </div>

        <p className="text-sm text-muted-foreground">
          {tier.backers.toString()} backers
        </p>

        <p className="text-sm line-clamp-2">{tier.benefits}</p>

        <Button
          className="w-full mt-2"
          onClick={handleFund}
          disabled={isFunding || !account}
        >
          {isFunding ? "Processing..." : "Fund Tier"}
        </Button>

        {isOwner && (
          <Button
            variant="destructive"
            className="w-full mt-2"
            onClick={handleRemoveTier}
            disabled={isRemoving}
          >
            {isRemoving ? "Removing..." : "Remove Tier"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
