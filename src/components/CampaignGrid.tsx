"use client";

import { useFactory } from "@/hooks/useFactory";
import { CampaignCard } from "./CampaignCard";
import { useState, useEffect } from "react";
import { useNetwork } from "@/lib/NetworkContext";
import { motion } from "framer-motion";
import { CardSkeleton } from "./ui/card-skeleton";
import { EmptyState } from "./ui/empty-state";
import { FolderPlus, Search } from "lucide-react";

interface CampaignGridProps {
  limit?: number; // Optional prop to limit the number of displayed campaigns
  showAll?: boolean; // Optional prop to show all campaigns regardless of state
  campaignAddresses?: string[]; // Optional prop to provide specific campaign addresses
}

export function CampaignGrid({ 
  limit, 
  showAll = false,
  campaignAddresses: providedAddresses 
}: CampaignGridProps) {
  const { campaignAddresses: fetchedAddresses, isLoading: addressesLoading } = useFactory();
  const [filteredCampaigns, setFilteredCampaigns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { network } = useNetwork();

  // Determine which addresses to use - provided or fetched
  const addressesToUse = providedAddresses || fetchedAddresses;
  const shouldFetchDetails = !providedAddresses; // Only fetch details if addresses not provided

  // Filter campaigns to only show active and not disabled ones
  useEffect(() => {
    if (!addressesLoading && addressesToUse && shouldFetchDetails) {
      setIsLoading(true);

      // Start with an empty array to collect filtered campaigns
      const fetchFilteredCampaigns = async () => {
        const filtered: string[] = [];

        // Process all campaign addresses in parallel
        const campaignDetailsPromises = addressesToUse.map(
          async (address) => {
            try {
              // Use the API endpoint to fetch campaign details efficiently
              const response = await fetch(
                `/api/campaign-details?address=${address}&chain=${network}`
              );
              if (!response.ok) return null;

              const campaign = await response.json();

              // Only include active (state 0) and not disabled campaigns
              if (showAll || (campaign.state === 0 && !campaign.isDisabled)) {
                return address;
              }
              return null;
            } catch (error) {
              console.error(`Error fetching details for ${address}:`, error);
              return null;
            }
          }
        );

        // Wait for all promises to resolve
        const results = await Promise.all(campaignDetailsPromises);

        // Filter out null values and add valid campaigns to filtered array
        results.forEach((campaignAddress) => {
          if (campaignAddress) {
            filtered.push(campaignAddress);
          }
        });

        setFilteredCampaigns(filtered);
        setIsLoading(false);
      };

      fetchFilteredCampaigns();
    } else if (providedAddresses) {
      // If addresses are provided directly, use them without filtering
      setFilteredCampaigns(providedAddresses);
      setIsLoading(false);
    }
  }, [addressesToUse, addressesLoading, showAll, network, providedAddresses, shouldFetchDetails]);

  // Number of skeleton placeholders to show while loading
  const skeletonCount = limit || 3;

  if (isLoading) {
    return <CardSkeleton count={skeletonCount} />;
  }

  // If limit is provided, slice the campaigns array; otherwise, show all campaigns
  const displayedCampaigns = limit
    ? filteredCampaigns.slice(0, limit)
    : filteredCampaigns;

  // If no campaigns match the filter criteria
  if (displayedCampaigns.length === 0) {
    return (
      <EmptyState 
        title="No campaigns found"
        message="No active campaigns available at the moment. Check back later or create your own campaign!"
        icon={showAll ? Search : FolderPlus}
        actionText="Create a Campaign"
        actionHref="/create"
      />
    );
  }

  // Animation variants for staggered loading
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {displayedCampaigns.map((campaignAddress) => (
        <motion.div
          key={campaignAddress}
          variants={item}
          className="h-full"
        >
          <CampaignCard campaignAddress={campaignAddress} />
        </motion.div>
      ))}
    </motion.div>
  );
}
