import { CreateCampaignForm } from "@/components/CreateCampaignForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Campaign",
};

export default function CreateCampaignPage() {
  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold">Create a Campaign</h1>
          <p className="text-muted-foreground">
            Launch your project and start receiving support from the community
          </p>
        </div>
        <CreateCampaignForm />
      </div>
    </div>
  );
}
