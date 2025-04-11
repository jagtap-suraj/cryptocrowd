"use client";

import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb/contract";
import { client } from "@/lib/client";
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { useNetwork } from "@/lib/NetworkContext";

interface CampaignDetails {
  name: string;
  description: string;
  imageHash: string;
  goal: bigint;
  deadline: bigint;
  balance: bigint;
  state: number; // 0=Active, 1=Successful, 2=Failed
  owner: string;
  isDisabled: boolean;
  backerCount?: bigint;
}

// Separate hook for contribution - this avoids conditional hook calls
function useContribution(
  campaignAddress: string,
  accountAddress: string | undefined
) {
  const { activeChain } = useNetwork();
  
  const contract = getContract({
    client,
    chain: activeChain,
    address: campaignAddress,
  });

  // Only get contribution if we have an account address
  const [contribution, setContribution] = useState<bigint | undefined>(
    undefined
  );

  // Always provide params, but conditionally enable the query
  const { data: contributionData } = useReadContract({
    contract,
    method: "function getBackerContribution(address) view returns (uint256)",
    params: [
      accountAddress || "0x0000000000000000000000000000000000000000",
    ] as const,
    queryOptions: { enabled: !!accountAddress },
  });

  useEffect(() => {
    // Only set contribution data if we have a real account
    if (accountAddress && contributionData) {
      setContribution(contributionData);
    }
  }, [contributionData, accountAddress]);

  return contribution;
}

export function useCampaign(campaignAddress: string) {
  const { activeChain } = useNetwork();
  
  const contract = getContract({
    client,
    chain: activeChain,
    address: campaignAddress,
  });

  // Get the current connected account
  const account = useActiveAccount();

  // Use getCampaignDetails function instead of multiple calls
  const { data: campaignDetailsData } =
    useReadContract({
      contract,
      method:
        "function getCampaignDetails() view returns ((address,string,string,string,uint256,uint256,uint256,uint8,address,bool))",
    });

  // Fetch backer count separately
  const { data: backerCountData } = useReadContract({
    contract,
    method: "function backerCount() view returns (uint256)",
  });

  // Combine all data when all calls are complete
  const [campaignData, setCampaignData] = useState<CampaignDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Get user contribution using the separate hook
  const userContribution = useContribution(campaignAddress, account?.address);

  useEffect(() => {
    if (campaignDetailsData) {
      setCampaignData({
        name: campaignDetailsData[1],
        description: campaignDetailsData[2],
        imageHash: campaignDetailsData[3],
        goal: campaignDetailsData[4],
        deadline: campaignDetailsData[5],
        balance: campaignDetailsData[6],
        state: campaignDetailsData[7],
        owner: campaignDetailsData[8],
        isDisabled: campaignDetailsData[9],
        backerCount: backerCountData,
      });
      setIsLoading(false);
    }
  }, [campaignDetailsData, backerCountData]);

  return {
    data: campaignData,
    isLoading,
    userContribution,
  };
}
