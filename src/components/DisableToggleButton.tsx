"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getContract } from "thirdweb/contract";
import { polygon } from "thirdweb/chains";
import { client } from "@/lib/client";
import { prepareContractCall } from "thirdweb";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DisableToggleButtonProps {
  campaignAddress: string;
  isDisabled: boolean;
  onToggleSuccess?: () => void;
}

export function DisableToggleButton({
  campaignAddress,
  isDisabled,
  onToggleSuccess,
}: DisableToggleButtonProps) {
  const [open, setOpen] = useState(false);
  const { mutate: sendTx, isPending } = useSendTransaction();

  const handleToggle = () => {
    const contract = getContract({
      client,
      chain: polygon,
      address: campaignAddress,
    });

    const toggleTx = prepareContractCall({
      contract,
      method: "function toggleDisabled()",
    });

    sendTx(toggleTx, {
      onSuccess: () => {
        toast.success(isDisabled ? "Campaign enabled" : "Campaign disabled", {
          description: isDisabled
            ? "The campaign is now accepting donations."
            : "The campaign is no longer accepting donations.",
        });
        setOpen(false);
        if (onToggleSuccess) {
          onToggleSuccess();
        }
      },
      onError: (error) => {
        toast.error("Operation failed", {
          description: error.message,
        });
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={isDisabled ? "outline" : "destructive"} size="sm">
          {isDisabled ? "Enable Campaign" : "Disable Campaign"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isDisabled ? "Enable Campaign" : "Disable Campaign"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isDisabled
              ? "This will enable the campaign and allow it to accept new donations. Are you sure you want to proceed?"
              : "This will disable the campaign and prevent it from accepting new donations. Are you sure you want to proceed?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleToggle} disabled={isPending}>
            {isPending ? "Processing..." : isDisabled ? "Enable" : "Disable"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
