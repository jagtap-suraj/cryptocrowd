"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useActiveAccount } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { getContract } from "thirdweb/contract";
import { client } from "@/lib/client";
import { useSendTransaction } from "thirdweb/react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNetwork } from "@/lib/NetworkContext";
import { Power } from "lucide-react";

interface DisableButtonProps {
  campaignAddress: string;
  campaignState: number;
  owner: string;
  isDisabled: boolean;
  onSuccess?: () => void;
}

export function DisableButton({
  campaignAddress,
  campaignState,
  owner,
  isDisabled,
  onSuccess,
}: DisableButtonProps) {
  const account = useActiveAccount();
  const { activeChain } = useNetwork();
  const { mutate: toggleDisable, isPending: isProcessing } =
    useSendTransaction();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);

  const contract = getContract({
    client,
    chain: activeChain,
    address: campaignAddress,
  });

  const isOwner = account?.address === owner;
  const canToggleDisable = campaignState === 0 && isOwner; // Only active campaign owners can toggle disabled state

  const handleToggleDisable = () => {
    // For disabling, show a confirmation dialog first
    if (!isDisabled) {
      setShowConfirmDialog(true);
      return;
    }

    // For enabling, proceed directly
    executeToggleDisable();
  };

  const executeToggleDisable = () => {
    // Close confirmation dialog if open
    setShowConfirmDialog(false);

    // Show waiting toast
    const loadingToast = toast.loading(
      isDisabled ? "Enabling campaign..." : "Disabling campaign...",
      { duration: 60000 } // Long duration to ensure it stays until dismissed
    );

    setWaitingForConfirmation(true);

    // Use the correct function name from the contract
    const toggleTransaction = prepareContractCall({
      contract,
      method: "function toggleDisabled() external",
    });

    toggleDisable(toggleTransaction, {
      onSuccess: () => {
        // First wait for the transaction to be mined
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
          toast.success(
            isDisabled
              ? "Campaign enabled successfully!"
              : "Campaign disabled successfully!",
            { duration: 5000 }
          );

          // Call onSuccess callback if provided
          if (onSuccess) {
            onSuccess();
          } else {
            // Force a hard refresh of the page if no callback
            window.location.reload();
          }
        }, 8000); // Increased wait time to 8 seconds for blockchain confirmation
      },
      onError: (error) => {
        toast.dismiss(loadingToast);
        setWaitingForConfirmation(false);

        toast.error(
          isDisabled
            ? "Failed to enable campaign"
            : "Failed to disable campaign",
          { description: error.message }
        );
      },
    });
  };

  if (!canToggleDisable) return null;

  return (
    <>
      <Button
        onClick={handleToggleDisable}
        disabled={isProcessing || waitingForConfirmation}
        variant={isDisabled ? "outline" : "destructive"}
        className="w-full mt-4 rounded-lg hover:scale-[1.02] transition-all duration-200 flex items-center gap-2 justify-center"
      >
        <Power className="w-4 h-4" />
        {isProcessing || waitingForConfirmation
          ? waitingForConfirmation
            ? "Waiting for confirmation..."
            : "Processing..."
          : isDisabled
          ? "Enable Campaign"
          : "Disable Campaign"}
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable this campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              Disabling this campaign will prevent new donations. This action
              can be reversed later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeToggleDisable}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Disable Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
