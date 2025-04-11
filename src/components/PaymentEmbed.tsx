// "use client";

// import { PayEmbed, getDefaultToken } from "thirdweb/react";
// import { client } from "@/lib/client";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { useNetwork } from "@/lib/NetworkContext";

// interface PaymentEmbedProps {
//   isOpen: boolean;
//   onOpenChange: (open: boolean) => void;
//   amount?: string;
//   campaignAddress: string;
//   onSuccess?: () => void;
// }

// export function PaymentEmbed({ isOpen, onOpenChange, amount = "0.01", campaignAddress, onSuccess }: PaymentEmbedProps) {
//   const { activeChain, currencySymbol } = useNetwork();

//   const handleSuccess = () => {
//     if (onSuccess) {
//       onSuccess();
//     }
//     toast.success("Purchase successful! Your donation has been sent.");
//     onOpenChange(false);
//   };

//   const handlePurchaseSuccess = (data: any) => {
//     console.log("Purchase success data:", data);
//     handleSuccess();
//   };

//   const handleCancel = () => {
//     onOpenChange(false);
//   };

//   const handleManualCompletion = () => {
//     handleSuccess();
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[550px] h-[650px]">
//         <DialogHeader>
//           <DialogTitle>Donate with Card/UPI</DialogTitle>
//           <DialogDescription>
//             Make a donation to this campaign using card payment or UPI
//           </DialogDescription>
//         </DialogHeader>

//         <div className="mt-4 h-[500px] overflow-auto rounded-md border">
//           <PayEmbed
//             client={client}
//             theme="dark"
//             payOptions={{
//               mode: "direct_payment",
//               paymentInfo: {
//                 amount: amount,
//                 chain: activeChain,
//                 token: getDefaultToken(activeChain, "USDC"),
//                 sellerAddress: campaignAddress,
//               },
//               buyWithFiat: {
//                 preferredProvider: "TRANSAK",
//                 testMode: true,
//                 prefillSource: {
//                   currency: "USD"
//                 }
//               },
//               buyWithCrypto: {
//                 testMode: true
//               },
//               metadata: {
//                 name: "Donation to Campaign",
//                 image: "/logo.png"
//               },
//               onPurchaseSuccess: handlePurchaseSuccess
//             }}
//           />
//         </div>

//         <div className="mt-4 flex justify-between">
//           <Button onClick={handleCancel} variant="outline">
//             Cancel
//           </Button>
//           <Button onClick={handleManualCompletion}>
//             I've Completed My Donation
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
