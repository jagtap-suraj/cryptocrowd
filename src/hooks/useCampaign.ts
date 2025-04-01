"use client";

import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb/contract";
import { baseSepolia } from "thirdweb/chains";
import { client } from "@/lib/client";
import { useEffect, useState } from "react";

interface CampaignDetails {
  name: string;
  description: string;
  imageHash: string;
  goal: bigint;
  deadline: bigint;
  balance: bigint;
  state: number; // 0=Active, 1=Successful, 2=Failed
  owner: string;
  paused: boolean;
  tiers: {
    name: string;
    imageHash: string;
    amount: bigint;
    backers: bigint;
    benefits: string;
  }[];
}

export function useCampaign(campaignAddress: string) {
  const contract = getContract({
    client,
    chain: baseSepolia,
    address: campaignAddress,
  });

  // Individual calls for each property
  const { data: name } = useReadContract({
    contract,
    method: "function name() view returns (string)",
  });
  const { data: description } = useReadContract({
    contract,
    method: "function description() view returns (string)",
  });
  const { data: imageHash } = useReadContract({
    contract,
    method: "function imageHash() view returns (string)",
  });
  const { data: goal } = useReadContract({
    contract,
    method: "function goal() view returns (uint256)",
  });
  const { data: deadline } = useReadContract({
    contract,
    method: "function deadline() view returns (uint256)",
  });
  const { data: balance } = useReadContract({
    contract,
    method: "function getContractBalance() view returns (uint256)",
  });
  const { data: state } = useReadContract({
    contract,
    method: "function state() view returns (uint8)",
  });
  const { data: owner } = useReadContract({
    contract,
    method: "function owner() view returns (address)",
  });
  const { data: paused } = useReadContract({
    contract,
    method: "function paused() view returns (bool)",
  });
  const { data: tiers } = useReadContract({
    contract,
    method:
      "function getTiers() view returns ((string,string,uint256,uint256,string)[])",
  });

  // Combine all data when all calls are complete
  const [campaignData, setCampaignData] = useState<CampaignDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (
      name &&
      description &&
      imageHash &&
      goal !== undefined &&
      deadline !== undefined &&
      balance !== undefined &&
      state !== undefined &&
      owner &&
      paused !== undefined &&
      tiers
    ) {
      setCampaignData({
        name,
        description,
        imageHash,
        goal,
        deadline,
        balance,
        state,
        owner,
        paused,
        tiers: tiers.map((tier) => ({
          name: tier[0],
          imageHash: tier[1],
          amount: tier[2],
          backers: tier[3],
          benefits: tier[4],
        })),
      });
      setIsLoading(false);
    }
  }, [
    name,
    description,
    imageHash,
    goal,
    deadline,
    balance,
    state,
    owner,
    paused,
    tiers,
  ]);

  return { data: campaignData, isLoading };
}
