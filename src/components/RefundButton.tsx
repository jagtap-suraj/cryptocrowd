"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useActiveAccount } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { getContract } from "thirdweb/contract";
import { client } from "@/lib/client";
import { useSendTransaction } from "thirdweb/react";
import { toast } from "sonner";
import { useNetwork } from "@/lib/NetworkContext";

interface RefundButtonProps {
  campaignAddress: string;
  campaignState: number;
  userContribution?: bigint;
}

export function RefundButton({
  campaignAddress,
  campaignState,
  userContribution,
}: RefundButtonProps) {
  const account = useActiveAccount();
  const { activeChain } = useNetwork();
  const { mutate: refund, isPending: isRefunding } = useSendTransaction();
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);

  const contract = getContract({
    client,
    chain: activeChain,
    address: campaignAddress,
  });

  const canRefund =
    campaignState === 2 && // Failed state
    userContribution &&
    userContribution > 0n &&
    account;

  const handleRefund = () => {
    // Show waiting toast
    const loadingToast = toast.loading("Preparing refund transaction...", {
      duration: 60000,
    });

    setWaitingForConfirmation(true);

    const refundTransaction = prepareContractCall({
      contract,
      method: "function refund() external",
    });

    refund(refundTransaction, {
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
          toast.success("Refund processed successfully!", {
            description: "Your contribution has been refunded to your wallet",
            duration: 5000,
          });

          // Force a hard refresh of the page
          window.location.reload();
        }, 8000); // Increased wait time to 8 seconds for blockchain confirmation
      },
      onError: (error) => {
        toast.dismiss(loadingToast);
        setWaitingForConfirmation(false);

        toast.error("Refund failed", {
          description: error.message,
        });
      },
    });
  };

  if (!canRefund) return null;

  return (
    <Button
      onClick={handleRefund}
      disabled={isRefunding || waitingForConfirmation}
      variant="destructive"
      className="w-full mt-4"
    >
      {isRefunding || waitingForConfirmation
        ? waitingForConfirmation
          ? "Confirming Refund..."
          : "Processing Refund..."
        : "Request Refund"}
    </Button>
  );
}
