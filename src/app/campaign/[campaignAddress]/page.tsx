"use client";

import { DisableButton } from "@/components/DisableButton";
import { EditButton } from "@/components/EditButton";
import { RefundButton } from "@/components/RefundButton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WithdrawButton } from "@/components/WithdrawButton";
import { useCampaign } from "@/hooks/useCampaign";
import { client } from "@/lib/client";
import { useNetwork } from "@/lib/NetworkContext";
import { AlertTriangle, ArrowRightLeft, CalendarDays, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getContract, prepareContractCall } from "thirdweb";
import { useActiveAccount, useSendTransaction, type Theme } from "thirdweb/react";
import { formatEther } from "viem";
import { useTheme } from "next-themes";

// Add a simple cache for campaign data
const campaignCache = new Map();

export default function CampaignPage() {
  const params = useParams();
  const campaignAddress = params?.campaignAddress as string;
  const { theme } = useTheme();
  const {
    data: campaign,
    isLoading,
    userContribution,
  } = useCampaign(campaignAddress);
  const account = useActiveAccount();
  const { mutate: fund, isPending: isFunding } = useSendTransaction({
    payModal: {
      theme: theme as "light" | "dark" | Theme,
      buyWithFiat: {
        preferredProvider: "TRANSAK",
        testMode: true,
      },
    },
  });
  const [amount, setAmount] = useState("0.01");
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const { currencySymbol, activeChain, network } = useNetwork();
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  // Check if campaign belongs to current network
  useEffect(() => {
    // Store the network when campaign is first loaded successfully
    const campaignOriginalNetwork = localStorage.getItem(`campaign-network-${campaignAddress}`);
    
    if (campaign && !campaignOriginalNetwork) {
      // First time loading this campaign, save its network
      localStorage.setItem(`campaign-network-${campaignAddress}`, network);
    } else if (campaignOriginalNetwork && campaignOriginalNetwork !== network) {
      // Campaign was loaded on a different network than current
      setIsWrongNetwork(true);
    } else {
      setIsWrongNetwork(false);
    }
  }, [campaign, campaignAddress, network]);

  // Cache campaign data
  useEffect(() => {
    if (campaignCache.has(campaignAddress)) {
      // Using cached campaign data
    } else if (campaign) {
      // Cache the data once we have it
      campaignCache.set(campaignAddress, campaign);
    }
  }, [campaign, campaignAddress]);

  if (!campaignAddress) {
    toast.error("Invalid campaign address");
    return notFound();
  }

  // Show a loading state immediately
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 text-center">
        <p>Loading campaign details...</p>
        <p className="text-sm text-muted-foreground">
          Fetching data from blockchain...
        </p>
      </div>
    );
  }

  if (!campaign) {
    toast.error("Campaign not found or data incomplete");
    return notFound();
  }

  const progress = (Number(campaign.balance) / Number(campaign.goal)) * 100;

  // Calculate refund window if campaign failed
  const refundWindowDays = 7; // From contract's REFUND_WINDOW constant (7 days)
  let refundEndDate = null;
  let daysLeftForRefund = 0;

  if (campaign.state === 2) {
    // Failed state
    // Refund window starts when campaign deadline ends
    refundEndDate = new Date(
      Number(campaign.deadline) * 1000 + refundWindowDays * 24 * 60 * 60 * 1000
    );
    const now = new Date();
    daysLeftForRefund = Math.max(
      0,
      Math.ceil(
        (refundEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
  }

  const getImageUrl = () => {
    if (!campaign.imageHash) return "/placeholder-image.jpg";
    if (campaign.imageHash.startsWith("http")) return campaign.imageHash;
    if (campaign.imageHash.startsWith("ipfs://")) {
      return `https://ipfs.io/ipfs/${campaign.imageHash.replace(
        "ipfs://",
        ""
      )}`;
    }
    return `https://ipfs.io/ipfs/${campaign.imageHash}`;
  };

  const handleFund = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Show waiting toast
    const loadingToast = toast.loading("Preparing funding transaction...", {
      duration: 60000,
    });

    setWaitingForConfirmation(true);

    const contract = getContract({
      client,
      chain: activeChain,
      address: campaignAddress,
    });

    const fundTransaction = prepareContractCall({
      contract,
      method: "function fund() payable",
      value: BigInt(Math.floor(parseFloat(amount) * 1000000000000000000)),
    });

    fund(fundTransaction, {
      onSuccess: () => {
        // First transaction is sent
        toast.dismiss(loadingToast);

        // Show a temporary toast while waiting for confirmation
        const confirmingToast = toast.loading(
          "Waiting for blockchain confirmation...",
          {
            duration: 60000,
          }
        );

        // Add timeout to wait for blockchain confirmation - increased to 8 seconds
        setTimeout(() => {
          toast.dismiss(confirmingToast);
          setWaitingForConfirmation(false);

          // Show success message
          toast.success("Successfully funded the campaign!", {
            description: `Your donation of ${amount} ${currencySymbol} has been processed`,
            duration: 5000,
          });

          setAmount("0.01");

          // Force a hard refresh of the page
          window.location.reload();
        }, 8000); // Increased wait time to 8 seconds for blockchain confirmation
      },
      onError: (error) => {
        toast.dismiss(loadingToast);
        setWaitingForConfirmation(false);

        toast.error("Funding failed", {
          description: error.message,
        });
      },
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {isWrongNetwork && (
        <div className="mb-6 p-4 bg-amber-100 border border-amber-300 rounded-md flex items-start gap-6">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h3 className="font-medium text-amber-800">Wrong Network</h3>
            <p className="text-amber-700 text-sm">
              This campaign belongs to a different network than the one you&apos;re currently using.
              {network === "polygon" ? (
                <span> Switch to <strong>Base Sepolia</strong> to interact with this campaign.</span>
              ) : (
                <span> Switch to <strong>Polygon</strong> to interact with this campaign.</span>
              )}
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-64 w-full rounded-lg overflow-hidden">
            <Image
              src={getImageUrl()}
              alt={campaign.name}
              fill
              className="object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
              }}
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground mt-2">
              Created by {campaign.owner.slice(0, 6)}...
              {campaign.owner.slice(-4)}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">About this project</h2>
            <p className="text-muted-foreground">{campaign.description}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Current Status</h3>
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                  {campaign.state === 0
                    ? "Active"
                    : campaign.state === 1
                    ? "Successful"
                    : "Failed"}

                  {campaign.isDisabled && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      Disabled
                    </span>
                  )}
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Deadline</h3>
                <p className="text-muted-foreground text-sm flex items-center flex-wrap gap-2">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(
                      Number(campaign.deadline) * 1000
                    ).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {campaign.state === 0 && (
                    <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {Math.max(
                        0,
                        Math.ceil(
                          (Number(campaign.deadline) * 1000 - Date.now()) /
                            (1000 * 60 * 60 * 24)
                        )
                      )}{" "}
                      days left
                    </span>
                  )}
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Progress</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {formatEther(campaign.balance)} {currencySymbol}
                    </span>
                    <span className="text-muted-foreground">
                      of {formatEther(campaign.goal)} {currencySymbol}
                    </span>
                  </div>
                  <Progress value={progress > 100 ? 100 : progress} />
                  
                </div>
              </div>

              {campaign.backerCount ? (
                <div>
                  <h3 className="font-semibold">Community</h3>
                  <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>
                      {Number(campaign.backerCount) === 1
                        ? "1 person has backed this project"
                        : `${campaign.backerCount.toString()} people have backed this project`}
                    </span>
                  </p>
                </div>
              ) : null}

              {userContribution && userContribution > 0n && (
                <div>
                  <h3 className="font-semibold">Your Contribution</h3>
                  <p className="text-sm">{formatEther(userContribution)} {currencySymbol}</p>
                </div>
              )}

              {campaign.state === 0 && !campaign.isDisabled && (
                <div className="pt-4 space-y-3">
                  <h3 className="font-semibold">Support this project</h3>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0.01"
                      step="0.01"
                      className="border rounded-md px-3 py-2 flex-grow"
                    />
                    <span className="py-2">{currencySymbol}</span>
                  </div>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={handleFund}
                    disabled={
                      isFunding || 
                      waitingForConfirmation || 
                      campaign.state !== 0 || 
                      campaign.isDisabled ||
                      isWrongNetwork
                    }
                  >
                    {isFunding || waitingForConfirmation
                      ? "Processing..."
                      : campaign.state !== 0
                      ? "Campaign Ended"
                      : campaign.isDisabled
                      ? "Campaign Disabled"
                      : isWrongNetwork
                      ? "Wrong Network"
                      : `Fund with ${currencySymbol}`}
                  </Button>
                  {!account && (
                    <p className="text-xs text-muted-foreground">
                      Connect your wallet to support
                    </p>
                  )}
                  <p className="text-xs text-center mt-2">
                    <Link href="/currency-converter" className="text-primary hover:underline inline-flex items-center justify-center gap-1">
                      <span>Need to check currency rates?</span>
                      <ArrowRightLeft className="h-3 w-3" />
                    </Link>
                  </p>
                </div>
              )}

              {campaign.isDisabled && (
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    This campaign has been disabled by the owner and is not
                    accepting donations at this time.
                  </p>
                </div>
              )}
            </div>
          </div>

          <RefundButton
            campaignAddress={campaignAddress}
            campaignState={campaign.state}
            userContribution={userContribution}
          />

          {campaign.state === 2 &&
            userContribution &&
            userContribution > 0n && (
              <div className="mt-2 p-4 bg-card border rounded-md">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                      Refund Information
                    </h3>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm flex items-center justify-between">
                      <span>Your contribution</span>
                      <span className="font-medium">
                        {formatEther(userContribution)} {currencySymbol}
                      </span>
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Refund deadline
                      </span>
                      <span>
                        {refundEndDate?.toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </p>
                    <div className="mt-1 flex justify-end">
                      {daysLeftForRefund > 0 ? (
                        <span className="inline-flex items-center justify-center bg-muted text-muted-foreground text-xs px-2.5 py-0.5 rounded-full">
                          {daysLeftForRefund} days remaining
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center bg-muted text-muted-foreground text-xs px-2.5 py-0.5 rounded-full">
                          Window closed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          <WithdrawButton
            campaignAddress={campaignAddress}
            campaignState={campaign.state}
            owner={campaign.owner}
            balance={campaign.balance}
          />

          <DisableButton
            campaignAddress={campaignAddress}
            campaignState={campaign.state}
            owner={campaign.owner}
            isDisabled={campaign.isDisabled}
            onSuccess={() => window.location.reload()}
          />

          <EditButton
            campaignAddress={campaignAddress}
            campaignState={campaign.state}
            owner={campaign.owner}
            currentName={campaign.name}
            currentDescription={campaign.description}
            currentImageHash={campaign.imageHash}
            currentGoal={campaign.goal}
            deadline={campaign.deadline}
            onSuccess={() => window.location.reload()}
          />
        </div>
      </div>
    </div>
  );
}
