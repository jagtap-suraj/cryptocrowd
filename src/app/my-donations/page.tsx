"use client";

import { useDetailedUserDonations } from "@/hooks/useFactory";
import { DonationCard } from "@/components/DonationCard";
import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Wallet, Gift } from "lucide-react";

export default function MyDonations() {
  const account = useActiveAccount();
  const { data: donations, isLoading, isError } = useDetailedUserDonations();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!account) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-3xl font-bold mb-6">My Donations</h1>
        <EmptyState
          title="Wallet not connected"
          message="Please connect your wallet to view your donations."
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
        <h1 className="text-3xl font-bold mb-6">My Donations</h1>
        <CardSkeleton count={6} />
      </div>
    );
  }

  if (isError || !donations) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">My Donations</h1>
        <ErrorDisplay
          title="Failed to load donations"
          message="An error occurred while loading your donations. Please try again later."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Donations</h1>

      {donations.length === 0 ? (
        <EmptyState
          title="No donations yet"
          message="You haven't made any donations yet."
          icon={Gift}
          actionText="Explore Campaigns"
          actionHref="/"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation, index) => (
            <DonationCard
              key={`${donation[0]}-${index}`}
              campaignAddress={donation[0]}
              donatedAmount={donation[1]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
