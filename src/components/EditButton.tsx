"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { useActiveAccount } from "thirdweb/react";
import { prepareContractCall, getContract } from "thirdweb";
import { client } from "@/lib/client";
import { useSendTransaction } from "thirdweb/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { upload } from "thirdweb/storage";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useNetwork } from "@/lib/NetworkContext";

// Define the maximum values from the contract
const MAX_GOAL_POL = 1000; // 1000 ETH
const MAX_DURATION_DAYS = 365; // 1 year

interface EditButtonProps {
  campaignAddress: string;
  campaignState: number;
  owner: string;
  currentName: string;
  currentDescription: string;
  currentImageHash: string;
  currentGoal: bigint;
  deadline: bigint;
  onSuccess?: () => void;
}

export function EditButton({
  campaignAddress,
  campaignState,
  owner,
  currentName,
  currentDescription,
  currentImageHash,
  currentGoal,
  deadline,
  onSuccess,
}: EditButtonProps) {
  const account = useActiveAccount();
  const { activeChain, currencySymbol } = useNetwork();
  const [open, setOpen] = useState(false);
  const { mutate: updateCampaign, isPending } = useSendTransaction();

  // Calculate remaining days for the campaign
  const remainingTimeMs = Number(deadline) * 1000 - Date.now();
  const remainingDays = Math.max(
    0,
    Math.ceil(remainingTimeMs / (1000 * 60 * 60 * 24))
  );
  const maxExtensionDays = Math.min(remainingDays * 2, MAX_DURATION_DAYS);

  // Current goal in POL (for display and validation)
  const currentGoalPol = Number(currentGoal) / 1e18;

  // Format the deadline for display
  const deadlineDate = new Date(Number(deadline) * 1000);
  const formattedDeadline = deadlineDate.toLocaleDateString();

  // Create schema with the contract's validation rules
  const formSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
    image: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || file.size <= 5_000_000, "Max 5MB size"),
    newGoal: z
      .string()
      .optional()
      .refine((val) => !val || val.trim() !== "", "Goal cannot be empty")
      .refine((val) => !val || Number(val) > 0, "Goal must be greater than 0")
      .refine(
        (val) =>
          !val || (Number(val) >= currentGoalPol && Number(val) <= MAX_GOAL_POL),
        {
          message: `New goal must be equal to or greater than current goal (${currentGoalPol} ${currencySymbol}) and not exceed ${MAX_GOAL_POL} ${currencySymbol}`,
        }
      ),
    additionalDays: z
      .string()
      .optional()
      .refine((val) => !val || val.trim() !== "", "Days cannot be empty")
      .refine((val) => !val || Number(val) > 0, "Days must be greater than 0")
      .refine(
        (val) => !val || (Number(val) > 0 && Number(val) <= maxExtensionDays),
        {
          message: `Extension days must be between 1 and ${maxExtensionDays} days`,
        }
      ),
  });

  // Initialize form with react-hook-form and zod resolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentName,
      description: currentDescription,
      image: undefined,
      newGoal: currentGoalPol.toString(),
      additionalDays: "",
    },
  });

  const handleUpdate = async (values: z.infer<typeof formSchema>) => {
    // Check if at least one field has a valid value
    const hasValidUpdate =
      (values.name &&
        values.name.trim() !== "" &&
        values.name !== currentName) ||
      (values.description &&
        values.description.trim() !== "" &&
        values.description !== currentDescription) ||
      values.image instanceof File ||
      (values.newGoal && Number(values.newGoal) > 0) ||
      (values.additionalDays && Number(values.additionalDays) > 0);

    if (!hasValidUpdate) {
      toast.error("No changes detected", {
        description: "Please modify at least one field to update the campaign",
      });
      return;
    }

    // Show waiting toast
    const loadingToast = toast.loading("Preparing update transaction...", {
      duration: 60000,
    });

    try {
      // Convert string values to appropriate types
      const goalValue = values.newGoal
        ? BigInt(Math.floor(parseFloat(values.newGoal) * 1e18))
        : 0n;
      const daysValue = values.additionalDays
        ? parseInt(values.additionalDays)
        : 0;

      // Empty string check for text fields - contract will keep existing values if empty strings are passed
      const nameToUpdate = values.name?.trim() || currentName;
      const descriptionToUpdate =
        values.description?.trim() || currentDescription;

      // Handle image upload if a new image was provided
      let imageHashToUpdate = currentImageHash;
      if (values.image instanceof File) {
        try {
          imageHashToUpdate = await upload({
            client,
            files: [values.image],
          });
        } catch {
          toast.dismiss(loadingToast);
          toast.error("Failed to upload image", {
            description: "Please try again or use a different image",
          });
          return;
        }
      }

      const contract = getContract({
        client,
        chain: activeChain,
        address: campaignAddress,
      });

      const updateTransaction = prepareContractCall({
        contract,
        method:
          "function updateCampaignDetails(uint256,uint256,string,string,string)",
        params: [
          goalValue,
          BigInt(daysValue),
          nameToUpdate,
          descriptionToUpdate,
          imageHashToUpdate,
        ],
      });

      updateCampaign(updateTransaction, {
        onSuccess: () => {
          toast.dismiss(loadingToast);

          // Show a temporary toast while waiting for confirmation
          const confirmingToast = toast.loading(
            "Waiting for blockchain confirmation...",
            {
              duration: 60000,
            }
          );

          // Add timeout to wait for blockchain confirmation
          setTimeout(() => {
            toast.dismiss(confirmingToast);

            // Show success message
            toast.success("Campaign updated successfully!", {
              duration: 5000,
            });

            setOpen(false);

            // Call the onSuccess callback if provided
            if (onSuccess) {
              onSuccess();
            }
          }, 8000); // Wait time for blockchain confirmation
        },
        onError: (error) => {
          toast.dismiss(loadingToast);

          toast.error("Failed to update campaign", {
            description: error.message,
          });
        },
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error preparing transaction", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  // Check if user is the campaign owner
  const isOwner = account?.address === owner;

  // Check if campaign is active (state 0)
  const isActive = campaignState === 0;

  if (!isOwner || !isActive) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Edit Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription>
            Update your campaign details. Leave fields blank to keep current
            values.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder={`Current: ${currentName}`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Current: ${currentDescription.substring(
                        0,
                        50
                      )}${currentDescription.length > 50 ? "..." : ""}`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Campaign Image</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document
                              .getElementById("campaign-image-edit")
                              ?.click()
                          }
                          className="cursor-pointer"
                        >
                          Choose Image
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {value instanceof File
                            ? value.name
                            : "No new file chosen"}
                        </span>
                      </div>
                      <Input
                        id="campaign-image-edit"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                        {...{ ...fieldProps, value: undefined }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Goal ({currencySymbol})</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input type="number" step="0.01" {...field} />
                      <span>{currencySymbol}</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Current goal: {currentGoalPol} {currencySymbol}
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Extend by (Days)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Add days to extend deadline"
                        {...field}
                      />
                      <span>Days</span>
                    </div>
                  </FormControl>
                  <div className="mt-1">
                    <p className="text-xs text-muted-foreground">
                      Current deadline: {formattedDeadline}
                    </p>
                    <FormMessage className="text-xs">
                      {remainingDays > 0
                        ? `Remaining: ${remainingDays} days (Max extension: ${maxExtensionDays} days)`
                        : "Campaign already ended"}
                    </FormMessage>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
