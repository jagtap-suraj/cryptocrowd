"use client";

import { useCampaign } from "@/hooks/useCampaign";
import { Skeleton } from "./ui/skeleton";
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useNetwork } from "@/lib/NetworkContext";
import { CalendarIcon, Clock } from "lucide-react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface CampaignCardProps {
  campaignAddress: string;
  // These can be optional now
  name?: string;
  imageHash?: string;
  owner?: string;
}

export function CampaignCard({
  campaignAddress,
  name: initialName,
  imageHash: initialImageHash,
}: CampaignCardProps) {
  // Use the useCampaign hook to fetch additional details
  const { data: campaignDetails, isLoading } = useCampaign(campaignAddress);
  const [imageError, setImageError] = useState(false);
  const { currencySymbol } = useNetwork();

  // Use provided values or fall back to fetched values
  const name = initialName || campaignDetails?.name;
  const imageHash = initialImageHash || campaignDetails?.imageHash;

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

  // Calculate days left
  const daysLeft = useMemo(() => {
    if (!campaignDetails?.deadline) return 0;
    const deadline = Number(campaignDetails.deadline) * 1000;
    const now = Date.now();
    const timeLeft = deadline - now;
    return Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));
  }, [campaignDetails?.deadline]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (!campaignDetails) return 0;
    return Math.min(
      Number((campaignDetails.balance * 100n) / campaignDetails.goal),
      100
    );
  }, [campaignDetails]);

  if (isLoading) {
    return (
      <div className="rounded-xl overflow-hidden border shadow-sm h-[450px] animate-pulse">
        <div className="h-[225px] bg-muted"></div>
        <div className="p-5 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex justify-between pt-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>
    );
  }

  // Determine if the campaign should be grayed out (disabled)
  const isDisabled = campaignDetails?.isDisabled;

  // Get campaign state label and color
  const getStateInfo = () => {
    if (!campaignDetails) return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    
    switch (campaignDetails.state) {
      case 0:
        return { label: 'Active', color: 'bg-green-100 text-green-800' };
      case 1:
        return { label: 'Successful', color: 'bg-blue-100 text-blue-800' };
      case 2:
        return { label: 'Failed', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const stateInfo = getStateInfo();

  return (
    <Link href={`/campaign/${campaignAddress}`} className="block h-full">
      <div
        className={cn(
          "border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col bg-card",
          isDisabled && "opacity-70 grayscale hover:opacity-80"
        )}
      >
        <div className="relative w-full aspect-video">
          <Image
            src={imageError ? "/file.svg" : imageUrl}
            alt={name || "Campaign Image"}
            fill
            className="object-cover rounded-t-xl"
            onError={() => setImageError(true)}
          />

          {/* Status badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge 
              className={cn(
                "px-2 py-1 text-xs font-medium",
                stateInfo.color
              )}
            >
              {stateInfo.label}
            </Badge>
            
            {isDisabled && (
              <Badge variant="destructive" className="px-2 py-1 text-xs">
                Disabled
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold mb-2 line-clamp-1">{name || "Loading..."}</h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
            {campaignDetails?.description || "No description available"}
          </p>

          {/* Progress section */}
          <div className="mt-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">{progressPercentage}% funded</span>
              {campaignDetails?.state === 0 && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" /> {daysLeft} days left
                </span>
              )}
            </div>
            
            {/* Progress bar */}
            <Progress value={progressPercentage} className="h-2 mb-4" />

            {/* Stats */}
            <div className="flex justify-between text-sm">
              <div>
                <p className="font-medium">
                  {campaignDetails
                    ? `${(Number(campaignDetails.balance) / 1e18).toFixed(4)} ${currencySymbol}`
                    : `0 ${currencySymbol}`}
                </p>
                <p className="text-muted-foreground text-xs">
                  raised of{" "}
                  {campaignDetails
                    ? `${(Number(campaignDetails.goal) / 1e18).toFixed(2)} ${currencySymbol}`
                    : `0 ${currencySymbol}`}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium flex items-center justify-end gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {campaignDetails
                    ? new Date(
                        Number(campaignDetails.deadline) * 1000
                      ).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric'
                      })
                    : "N/A"}
                </p>
                <p className="text-muted-foreground text-xs">deadline</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
