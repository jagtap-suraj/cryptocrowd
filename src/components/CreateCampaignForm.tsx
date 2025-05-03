"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { getContract } from "thirdweb/contract";
import { client } from "@/lib/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "thirdweb/storage";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowRightLeft } from "lucide-react";
import { useNetwork } from "@/lib/NetworkContext";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= 5_000_000, "Max 5MB size"),
  goal: z.coerce.number().min(0.0001, "Goal must be at least 0.0001 POL"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 day"),
});

export function CreateCampaignForm() {
  const account = useActiveAccount();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { factoryAddress, activeChain, currencySymbol } = useNetwork();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      goal: 1,
      duration: 30,
    },
  });

  const { mutate: createCampaign } = useSendTransaction({
    payModal: {
      buyWithFiat: {
        preferredProvider: "TRANSAK",
        testMode: true,
      },
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!account) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet to create a campaign",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Log the form values
      console.log("Form values before upload:", {
        name: values.name,
        description: values.description,
        image: {
          name: values.image.name,
          size: values.image.size,
          type: values.image.type,
          lastModified: values.image.lastModified
        },
        goal: values.goal,
        duration: values.duration
      });

      // Attempt to upload the image and log detailed information
      console.log("Starting IPFS upload...");
      let imageUri;
      try {
        imageUri = await upload({
          client,
          files: [values.image],
        });
        console.log("IPFS upload successful:", imageUri);
      } catch (uploadError) {
        console.error("IPFS upload error details:", uploadError);
        // Log more details about the error
        if (uploadError instanceof Error) {
          console.error("Error message:", uploadError.message);
          console.error("Error stack:", uploadError.stack);
        }
        // Check if client is properly initialized
        console.log("Client configuration:", {
          clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ? "Set" : "Not set",
          secretKey: process.env.NEXT_PUBLIC_THIRDWEB_SECRET_KEY ? "Set" : "Not set"
        });
        throw uploadError; // Re-throw to be caught by outer catch block
      }

      const contract = getContract({
        client,
        chain: activeChain,
        address: factoryAddress,
      });

      console.log("Preparing contract call with:", {
        name: values.name,
        description: values.description,
        imageUri: imageUri,
        goal: BigInt(values.goal * 10 ** 18).toString(),
        duration: values.duration
      });

      createCampaign(
        prepareContractCall({
          contract,
          method:
            "function createCampaign(string,string,string,uint256,uint256)",
          params: [
            values.name,
            values.description,
            imageUri,
            BigInt(values.goal * 10 ** 18),
            BigInt(values.duration),
          ],
        }),
        {
          onSuccess: () => {
            toast.success("Campaign created!", {
              description: "Your campaign has been successfully launched.",
            });
            router.push(`/dashboard/${account.address}`);
          },
          onError: (error) => {
            console.error("Contract call error:", error);
            toast.error("Error", {
              description: error.message,
            });
          },
        }
      );
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Error", {
        description: "Failed to upload image",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!account && (
          <div className="bg-muted/50 p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Please connect your wallet to create a campaign
            </p>
          </div>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Name</FormLabel>
              <FormControl>
                <Input placeholder="My Awesome Project" {...field} />
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
                  placeholder="Tell people about your project..."
                  rows={5}
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
                          .getElementById("campaign-image-upload")
                          ?.click()
                      }
                      className="cursor-pointer"
                    >
                      Choose Image
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {value instanceof File ? value.name : "No file chosen"}
                    </span>
                  </div>
                  <Input
                    id="campaign-image-upload"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="goal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funding Goal ({currencySymbol})</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <Link href="/currency-converter" className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1">
                  <span>Check currency conversion rates</span>
                  <ArrowRightLeft className="h-3 w-3" />
                </Link>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (days)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !account}
        >
          {isLoading ? "Creating..." : "Launch Campaign"}
        </Button>
      </form>
    </Form>
  );
}
