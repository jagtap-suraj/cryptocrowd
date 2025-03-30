export interface Campaign {
  campaignAddress: string;
  owner: string;
  name: string;
  imageHash: string;
  creationTime: bigint;
}

export interface Tier {
  name: string;
  imageHash: string;
  amount: bigint;
  backers: bigint;
  benefits: string;
}

export interface CampaignDetails {
  name: string;
  description: string;
  imageHash: string;
  goal: bigint;
  deadline: bigint;
  balance: bigint;
  state: number;
  owner: string;
  tiers: Tier[];
}
