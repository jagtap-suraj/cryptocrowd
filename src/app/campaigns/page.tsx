import { CampaignGrid } from "@/components/CampaignGrid";

export default function AllCampaignsPage() {
  return (
    <main className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">All Campaigns</h1>
      <CampaignGrid />
    </main>
  );
}
