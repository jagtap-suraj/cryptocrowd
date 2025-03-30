"use client";

import { Skeleton } from "./ui/skeleton";
import { useFactory } from "@/hooks/useFactory";
import { CampaignCard } from "./CampaignCard";

interface CampaignGridProps {
  limit?: number; // Optional prop to limit the number of displayed campaigns
}

export function CampaignGrid({ limit }: CampaignGridProps) {
  const { data: campaigns, isLoading } = useFactory(); 

  // Number of skeleton placeholders to show while loading
  const skeletonCount = limit || 3;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(skeletonCount)].map((_, i) => (
          <Skeleton key={i} className="h-[400px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // If limit is provided, slice the campaigns array; otherwise, show all campaigns
  const displayedCampaigns = limit ? campaigns?.slice(0, limit) : campaigns;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayedCampaigns?.map((campaign) => (
        <div key={campaign.campaignAddress} className="transition-transform duration-200">
          <CampaignCard
            campaignAddress={campaign.campaignAddress}
            name={campaign.name}
            imageHash={campaign.imageHash}
          />
        </div>
      ))}
    </div>
  );
}
