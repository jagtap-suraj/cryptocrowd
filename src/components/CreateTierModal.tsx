"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSendTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { getContract } from "thirdweb/contract";
import { baseSepolia } from "thirdweb/chains";
import { client } from "@/lib/client";
import { useState } from "react";
import { upload } from "thirdweb/storage";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export function CreateTierModal({
  contractAddress,
}: {
  contractAddress: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [benefits, setBenefits] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const contract = getContract({
    client,
    chain: baseSepolia,
    address: contractAddress,
  });

  const { mutate: addTier } = useSendTransaction();

  async function handleSubmit() {
    if (!name || !amount || !benefits) return;
    setIsLoading(true);

    try {
      let imageUri = "";
      if (image) {
        imageUri = await upload({
          client,
          files: [image],
        });
      }

      addTier(
        prepareContractCall({
          contract,
          method: "function addTier(string,string,uint256,string)",
          params: [name, imageUri, BigInt(Number(amount) * 10 ** 18), benefits],
        }),
        {
          onSuccess: () => {
            toast.success("Tier added successfully");
            setOpen(false);
            resetForm();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setName("");
    setAmount("");
    setBenefits("");
    setImage(null);
  }

  return (
    <>
      <Toaster />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Add Tier</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tier</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tier Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Gold Tier"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (ETH)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1.0"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Benefits</label>
              <Textarea
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                placeholder="Backers will receive..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tier Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </div>

            <Button
              className="w-full mt-4"
              onClick={handleSubmit}
              disabled={isLoading || !name || !amount || !benefits}
            >
              {isLoading ? "Creating..." : "Create Tier"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
