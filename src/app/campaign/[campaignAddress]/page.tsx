"use client";

import { CreateTierModal } from "@/components/CreateTierModal";
import { TierCard } from "@/components/TierCard";
import { Progress } from "@/components/ui/progress";
import { useCampaign } from "@/hooks/useCampaign";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useActiveAccount } from "thirdweb/react";
import { formatEther } from "viem";

// Add a simple cache for campaign data
const campaignCache = new Map();

export default function CampaignPage() {
  const params = useParams();
  const campaignAddress = params?.campaignAddress as string;
  const { data: campaign, isLoading } = useCampaign(campaignAddress);
  const account = useActiveAccount();

  // Show a loader immediately
  useEffect(() => {
    // Check if we have cached data
    if (campaignCache.has(campaignAddress)) {
      // setIsPageLoading(false);
    } else if (campaign) {
      // Cache the data once we have it
      campaignCache.set(campaignAddress, campaign);
      // setIsPageLoading(false);
    }
  }, [campaign, campaignAddress]);

  // Force a quick transition to loaded state after 2 seconds maximum
  useEffect(() => {
    const timer = setTimeout(() => {
      // setIsPageLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!campaignAddress) {
    toast.error("Invalid campaign address");
    return notFound();
  }

  // Show a loading state immediately
  if (isLoading) {
    return (
      <div className="container py-8 text-center">
        <p>Loading campaign details...</p>
        <p className="text-sm text-muted-foreground">
          Fetching data from blockchain...
        </p>
      </div>
    );
  }

  if (!campaign) {
    toast.error("Campaign not found or data incomplete");
    return notFound();
  }

  const progress = (Number(campaign.balance) / Number(campaign.goal)) * 100;
  const isOwner = account?.address === campaign.owner;

  const getImageUrl = () => {
    if (!campaign.imageHash) return "/placeholder-image.jpg";
    if (campaign.imageHash.startsWith("http")) return campaign.imageHash;
    if (campaign.imageHash.startsWith("ipfs://")) {
      return `https://ipfs.io/ipfs/${campaign.imageHash.replace("ipfs://", "")}`;
    }
    return `https://ipfs.io/ipfs/${campaign.imageHash}`;
  };

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-64 w-full rounded-lg overflow-hidden">
            <Image
              src={getImageUrl()}
              alt={campaign.name}
              fill
              className="object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
              }}
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground mt-2">
              Created by {campaign.owner.slice(0, 6)}...
              {campaign.owner.slice(-4)}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">About this project</h2>
            <p className="text-muted-foreground">{campaign.description}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Current Status</h3>
                <p className="text-muted-foreground text-sm">
                  {campaign.state === 0
                    ? "Active"
                    : campaign.state === 1
                    ? "Successful"
                    : "Failed"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Progress</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {formatEther(campaign.balance)} ETH
                    </span>
                    <span className="text-muted-foreground">
                      of {formatEther(campaign.goal)} ETH
                    </span>
                  </div>
                  <Progress value={progress > 100 ? 100 : progress} />
                </div>
              </div>

              {isOwner && (
                <div className="pt-4">
                  <CreateTierModal contractAddress={campaignAddress} />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Support this project</h2>
            <div className="grid grid-cols-1 gap-4">
              {campaign.tiers.map((tier, index) => (
                <TierCard
                  key={index}
                  tier={tier}
                  index={index}
                  contractAddress={campaignAddress}
                  isOwner={isOwner}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}