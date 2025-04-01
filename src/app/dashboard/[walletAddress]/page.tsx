"use client";

import { useFactory } from "@/hooks/useFactory";
import { Button } from "@/components/ui/button";
import { useActiveAccount } from "thirdweb/react";
import { useRouter, useParams } from "next/navigation";
import { CampaignCard } from "@/components/CampaignCard";
import { toast } from "sonner";

interface Campaign {
  campaignAddress: string;
  owner: string;
  name: string;
  imageHash: string;
}

export default function DashboardPage() {
  const params = useParams();
  const walletAddress = params?.walletAddress as string;
  const { data: allCampaigns, isLoading, error } = useFactory();
  const account = useActiveAccount();
  const router = useRouter();

  if (!walletAddress) {
    return (
      <div className="container py-8 text-center">
        <p>Invalid wallet address</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="container py-8 text-center">
        <p>Please connect your wallet to view your dashboard</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8 text-center">
        <p>Loading your campaigns...</p>
      </div>
    );
  }

  if (error) {
    toast.error("Failed to load campaigns");
    return (
      <div className="container py-8 text-center">
        <p>Error loading campaigns. Please try again later.</p>
      </div>
    );
  }

  const myCampaigns: Campaign[] =
    allCampaigns?.filter(
      (c) => c.owner.toLowerCase() === walletAddress.toLowerCase()
    ) || [];

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Campaigns</h1>
        <Button onClick={() => router.push("/create")}>Create New</Button>
      </div>

      {myCampaigns.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing campaigns for: {walletAddress}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.campaignAddress}
                campaignAddress={campaign.campaignAddress}
                name={campaign.name}
                imageHash={campaign.imageHash}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            You haven&apos;t created any campaigns yet
          </p>
          <Button className="mt-4" onClick={() => router.push("/create")}>
            Create Your First Campaign
          </Button>
        </div>
      )}
    </div>
  );
}
