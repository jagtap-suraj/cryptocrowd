"use client";

import { useUserCampaigns } from "@/hooks/useFactory";
import { Button } from "@/components/ui/button";
import { useActiveAccount } from "thirdweb/react";
import { useRouter, useParams } from "next/navigation";
import { CampaignCard } from "@/components/CampaignCard";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorDisplay } from "@/components/ui/error-display";
import { toast } from "sonner";
import { PlusCircle, Wallet, FolderOpen } from "lucide-react";

export default function DashboardPage() {
  const params = useParams();
  const walletAddress = params?.walletAddress as string;
  const { data: userCampaigns, isLoading, error } = useUserCampaigns();
  const account = useActiveAccount();
  const router = useRouter();

  if (!walletAddress) {
    return (
      <div className="container mx-auto py-10">
        <ErrorDisplay
          title="Invalid address"
          message="The wallet address provided is invalid."
          actionText="Return to Home"
          actionHref="/"
        />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-3xl font-bold mb-6">My Campaigns</h1>
        <EmptyState
          title="Wallet not connected"
          message="Please connect your wallet to view your campaigns."
          icon={Wallet}
          actionText="Return to Home"
          actionHref="/"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Campaigns</h1>
          <Button onClick={() => router.push("/create")}>Create New</Button>
        </div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  if (error) {
    toast.error("Failed to load campaigns");
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">My Campaigns</h1>
        <ErrorDisplay
          title="Failed to load campaigns"
          message="An error occurred while loading your campaigns. Please try again later."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Campaigns</h1>
        <Button 
          onClick={() => router.push("/create")} 
          className="flex items-center gap-2 rounded-full px-6 hover:scale-105 transition-all duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          Create New
        </Button>
      </div>

      {userCampaigns && userCampaigns.length > 0 ? (
        <>
          <div className="mb-6 text-sm text-muted-foreground">
            Showing campaigns for: {walletAddress}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.campaignAddress}
                campaignAddress={campaign.campaignAddress}
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title="No campaigns yet"
          message="You haven't created any campaigns yet."
          icon={FolderOpen}
          actionText="Create Your First Campaign"
          actionHref="/create"
        />
      )}
    </div>
  );
}
