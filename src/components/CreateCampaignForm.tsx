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
import { baseSepolia } from "thirdweb/chains";
import { client } from "@/lib/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "thirdweb/storage";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= 5_000_000, "Max 5MB size"),
  goal: z.coerce.number().min(0.1, "Goal must be at least 0.1 ETH"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 day"),
});

export function CreateCampaignForm() {
  const account = useActiveAccount();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      goal: 1,
      duration: 30,
    },
  });

  const { mutate: createCampaign } = useSendTransaction();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!account) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet to create a campaign",
      });
      return;
    }

    setIsLoading(true);
    try {
      const imageUri = await upload({
        client,
        files: [values.image],
      });

      const contract = getContract({
        client,
        chain: baseSepolia,
        address: process.env.NEXT_PUBLIC_CROWDFUNDING_FACTORY!,
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
            toast.error("Error", {
              description: error.message,
            });
          },
        }
      );
    } catch (error) {
      console.error(error);
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
          render={({ field: { onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Campaign Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files?.[0])}
                  {...{ ...fieldProps, value: undefined }}
                />
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
                <FormLabel>Funding Goal (ETH)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
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
