"use client";

import { useCampaign } from "@/hooks/useCampaign";
import { Skeleton } from "./ui/skeleton";
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatEther } from "viem";
import { useNetwork } from "@/lib/NetworkContext";

interface DonationCardProps {
  campaignAddress: string;
  donatedAmount: bigint;
}

export function DonationCard({
  campaignAddress,
  donatedAmount,
}: DonationCardProps) {
  // Use the useCampaign hook to fetch additional details
  const { data: campaignDetails, isLoading } = useCampaign(campaignAddress);
  const [imageError, setImageError] = useState(false);
  const { currencySymbol } = useNetwork();

  const imageUrl = useMemo(() => {
    // Default fallback image
    const fallbackImage = "/file.svg";

    // If no imageHash is provided, return fallback
    if (!campaignDetails?.imageHash) return fallbackImage;

    try {
      // Handle IPFS URLs
      let processedImageHash = campaignDetails.imageHash;

      if (processedImageHash.includes("ipfs://")) {
        return processedImageHash.replace("ipfs://", "https://ipfs.io/ipfs/");
      } else {
        processedImageHash = `https://ipfs.io/ipfs/${processedImageHash}`;
      }

      // For other URLs, validate them
      if (
        processedImageHash.startsWith("http://") ||
        processedImageHash.startsWith("https://")
      ) {
        // Test if it's a valid URL
        new URL(processedImageHash);
        return processedImageHash;
      }

      // If it's not a valid URL format, return fallback
      return fallbackImage;
    } catch {
      // If any error occurs during URL construction, use fallback
      console.error("Invalid image URL:", campaignDetails?.imageHash);
      return fallbackImage;
    }
  }, [campaignDetails?.imageHash]);

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full rounded-lg" />;
  }

  return (
    <Link href={`/campaign/${campaignAddress}`} className="block">
      <div className="border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer">
        <div className="relative w-full h-[150px]">
          <Image
            src={imageError ? "/file.svg" : imageUrl}
            alt={campaignDetails?.name || "Campaign Image"}
            fill
            className="object-cover rounded-t-md"
            onError={() => setImageError(true)}
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">
            {campaignDetails?.name}
          </h3>

          <div className="flex justify-between items-center mt-2">
            <div>
              <p className="text-sm font-medium">Your Donation:</p>
              <p className="text-base font-bold">
                {formatEther(donatedAmount)} {currencySymbol}
              </p>
            </div>

            {/* Status badge */}
            {campaignDetails && (
              <div
                className={`inline-block px-2 py-1 rounded text-xs font-medium
                ${
                  campaignDetails.state === 0
                    ? "bg-green-100 text-green-800"
                    : campaignDetails.state === 1
                    ? "bg-blue-100 text-blue-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {campaignDetails.state === 0
                  ? "Active"
                  : campaignDetails.state === 1
                  ? "Successful"
                  : "Failed"}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
