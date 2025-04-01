"use client";

import { useCampaign } from "@/hooks/useCampaign";
import { Skeleton } from "./ui/skeleton"; // Assuming you have this component
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

interface CampaignCardProps {
  campaignAddress: string;
  name: string;
  imageHash: string;
}

export function CampaignCard({
  campaignAddress,
  name,
  imageHash,
}: CampaignCardProps) {
  // Use the useCampaign hook to fetch additional details
  const { data: campaignDetails, isLoading } = useCampaign(campaignAddress);
  const [imageError, setImageError] = useState(false);

  const imageUrl = useMemo(() => {
    // Default fallback image
    const fallbackImage = "/file.svg";

    // If no imageHash is provided, return fallback
    if (!imageHash) return fallbackImage;

    try {
      // Handle IPFS URLs
      let processedImageHash = imageHash; // Create a new variable instead of modifying imageHash

      if (imageHash.includes("ipfs://")) {
        return imageHash.replace("ipfs://", "https://ipfs.io/ipfs/");
      } else {
        processedImageHash = `https://ipfs.io/ipfs/${imageHash}`;
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
      console.error("Invalid image URL:", imageHash);
      return fallbackImage;
    }
  }, [imageHash]);

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-lg" />;
  }

  return (
    <Link href={`/campaign/${campaignAddress}`} className="block">
      <div className="border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer">
        <div className="relative w-full h-[225px]">
          <Image
            src={imageError ? "/file.svg" : imageUrl}
            alt={name || "Campaign Image"}
            fill
            className="object-cover rounded-t-md"
            onError={() => setImageError(true)}
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{name}</h3>
          <p className="text-sm text-gray-600 mb-4">
            {campaignDetails?.description
              ? campaignDetails.description.length > 100
                ? campaignDetails.description.substring(0, 100) + "..."
                : campaignDetails.description
              : ""}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{
                width: `${
                  campaignDetails
                    ? Math.min(
                        Number(
                          (campaignDetails.balance * 100n) /
                            campaignDetails.goal
                        ),
                        100
                      )
                    : 0
                }%`,
              }}
            ></div>
          </div>

          {/* Stats */}
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-medium">
                {campaignDetails
                  ? `${(Number(campaignDetails.balance) / 1e18).toFixed(4)} ETH`
                  : "0 ETH"}
              </p>
              <p className="text-gray-500">
                raised of{" "}
                {campaignDetails
                  ? `${(Number(campaignDetails.goal) / 1e18).toFixed(2)} ETH`
                  : "0 ETH"}
              </p>
            </div>
            <div>
              <p className="font-medium">
                {campaignDetails
                  ? new Date(
                      Number(campaignDetails.deadline) * 1000
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
              <p className="text-gray-500">deadline</p>
            </div>
          </div>

          {/* Status badge */}
          {campaignDetails && (
            <div
              className={`mt-3 inline-block px-2 py-1 rounded text-xs font-medium
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
    </Link>
  );
}
