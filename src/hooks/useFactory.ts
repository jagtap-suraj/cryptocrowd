"use client";

import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb/contract";
import { baseSepolia } from "thirdweb/chains";
import { client } from "@/lib/client";
import { useState } from "react";

export interface Campaign {
  campaignAddress: string;
  owner: string;
  name: string;
  imageHash: string;
  creationTime: bigint;
}

export function useFactory() {
  const [internalError, setInternalError] = useState<Error | null>(null);

  const contract = getContract({
    client,
    chain: baseSepolia,
    address: process.env.NEXT_PUBLIC_CROWDFUNDING_FACTORY!,
  });

  const readContractResult = useReadContract({
    contract,
    method:
      "function getAllCampaigns() view returns ((address,address,string,string, uint256)[])",
    params: [],
  });

  try {
    const { data, isLoading, isError, error, ...rest } = readContractResult;

    const campaigns = data?.map((campaignTuple) => {
      const campaign = {
        campaignAddress: campaignTuple[0],
        owner: campaignTuple[1],
        name: campaignTuple[2],
        imageHash: campaignTuple[3],
        creationTime: campaignTuple[4],
      };
      return campaign;
    });

    return {
      data: campaigns,
      isLoading,
      isError: isError || !!internalError,
      error: error || internalError,
      ...rest,
    };
  } catch (error) {
    const finalError =
      error instanceof Error ? error : new Error(String(error));
    setInternalError(finalError);

    return {
      data: undefined,
      isLoading: false,
      isError: true,
      error: finalError,
    };
  }
}
