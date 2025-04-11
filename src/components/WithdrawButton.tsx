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

interface WithdrawButtonProps {
  campaignAddress: string;
  campaignState: number;
  owner: string;
  balance: bigint;
}

export function WithdrawButton({
  campaignAddress,
  campaignState,
  owner,
  balance,
}: WithdrawButtonProps) {
  const account = useActiveAccount();
  const { activeChain } = useNetwork();
  const { mutate: withdraw, isPending: isWithdrawing } = useSendTransaction();
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);

  const contract = getContract({
    client,
    chain: activeChain,
    address: campaignAddress,
  });

  const canWithdraw =
    campaignState === 1 && // Successful state
    account?.address === owner &&
    balance > 0n;

  const handleWithdraw = () => {
    // Show waiting toast
    const loadingToast = toast.loading("Preparing withdrawal transaction...", {
      duration: 60000,
    });

    setWaitingForConfirmation(true);

    const withdrawTransaction = prepareContractCall({
      contract,
      method: "function withdraw() external",
    });

    withdraw(withdrawTransaction, {
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
          toast.success("Funds withdrawn successfully!", { duration: 5000 });

          // Force a hard refresh of the page
          window.location.reload();
        }, 8000); // Increased wait time to 8 seconds for blockchain confirmation
      },
      onError: (error) => {
        toast.dismiss(loadingToast);
        setWaitingForConfirmation(false);

        toast.error("Withdrawal failed", {
          description: error.message,
        });
      },
    });
  };

  if (!canWithdraw) return null;

  return (
    <Button
      onClick={handleWithdraw}
      disabled={isWithdrawing || waitingForConfirmation}
      variant="default"
      className="w-full mt-4"
    >
      {isWithdrawing || waitingForConfirmation
        ? waitingForConfirmation
          ? "Confirming Withdrawal..."
          : "Processing Withdrawal..."
        : "Withdraw Funds"}
    </Button>
  );
}
