"use client";

import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb/contract";
import { client } from "@/lib/client";
import { useActiveAccount } from "thirdweb/react";
import { useNetwork } from "@/lib/NetworkContext";

export interface Campaign {
  campaignAddress: string;
  owner: string;
  name: string;
  imageHash: string;
  creationTime?: bigint;
}

export interface BackerDonation {
  campaignAddress: string;
  donatedAmount: bigint;
}

/**
 * Hook to fetch all campaigns from the factory
 */
export function useFactory() {
  const { factoryAddress, activeChain } = useNetwork();

  const contract = getContract({
    client,
    chain: activeChain,
    address: factoryAddress,
  });

  // Get all campaign addresses
  const {
    data: campaignAddresses,
    isLoading,
    isError,
    error,
  } = useReadContract({
    contract,
    method: "function getAllCampaignAddresses() view returns (address[])",
  });

  return {
    data: campaignAddresses?.map((address) => ({
      campaignAddress: address,
      owner: "",
      name: "",
      imageHash: "",
    })) as Campaign[] | undefined,
    isLoading,
    isError,
    error,
    campaignAddresses,
  };
}

/**
 * Hook to fetch campaigns created by the current user
 */
export function useUserCampaigns() {
  const account = useActiveAccount();
  const { factoryAddress, activeChain } = useNetwork();

  const contract = getContract({
    client,
    chain: activeChain,
    address: factoryAddress,
  });

  // Always provide params, but conditionally enable the query
  const {
    data: campaignAddresses,
    isLoading,
    isError,
    error,
  } = useReadContract({
    contract,
    method:
      "function getUserCampaignAddresses(address) view returns (address[])",
    params: [
      account?.address || "0x0000000000000000000000000000000000000000",
    ] as const,
    queryOptions: { enabled: !!account },
  });

  // Transform addresses to Campaign objects
  const campaigns = campaignAddresses?.map((address) => ({
    campaignAddress: address,
    owner: "",
    name: "",
    imageHash: "",
  })) as Campaign[] | undefined;

  return {
    data: campaigns,
    isLoading,
    isError,
    error,
    campaignAddresses,
  };
}

/**
 * Hook to fetch campaigns backed by the current user
 */
export function useUserDonations() {
  const account = useActiveAccount();
  const { factoryAddress, activeChain } = useNetwork();

  const contract = getContract({
    client,
    chain: activeChain,
    address: factoryAddress,
  });

  // Always provide params, but conditionally enable the query
  const {
    data: backerCampaignAddresses,
    isLoading,
    isError,
    error,
  } = useReadContract({
    contract,
    method:
      "function getBackerCampaignAddresses(address) view returns (address[])",
    params: [
      account?.address || "0x0000000000000000000000000000000000000000",
    ] as const,
    queryOptions: { enabled: !!account },
  });

  return {
    data: backerCampaignAddresses,
    isLoading,
    isError,
    error,
  };
}

/**
 * Hook to fetch detailed backer donations from the factory
 */
export function useDetailedUserDonations() {
  const account = useActiveAccount();
  const { factoryAddress, activeChain } = useNetwork();

  const contract = getContract({
    client,
    chain: activeChain,
    address: factoryAddress,
  });

  // Get detailed backer donations using the updated contract method with address parameter
  const { data, isLoading, isError, error } = useReadContract({
    contract,
    method:
      "function getBackerDonations(address) view returns ((address,uint256)[])",
    params: [
      account?.address || "0x0000000000000000000000000000000000000000",
    ] as const,
    queryOptions: { enabled: !!account },
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
}
