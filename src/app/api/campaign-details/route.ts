import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/client";
import { getContract } from "thirdweb/contract";
import { readContract } from "thirdweb";
import { polygon, baseSepolia } from "thirdweb/chains";

// Implement a simple rate limiter
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 50;
const requestCounts: Record<string, { count: number; resetTime: number }> = {};

function rateLimit(ip: string): boolean {
  const now = Date.now();

  // Initialize or reset counter if needed
  if (!requestCounts[ip] || now > requestCounts[ip].resetTime) {
    requestCounts[ip] = {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }

  // Increment count
  requestCounts[ip].count++;

  // Check if rate limit exceeded
  return requestCounts[ip].count > MAX_REQUESTS_PER_WINDOW;
}

export async function GET(request: NextRequest) {
  // Get the IP address from request headers or connection
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0] : "unknown";

  // Apply rate limiting
  if (rateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    // Get campaign address and chain from query parameters
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const chainParam = searchParams.get("chain");

    if (!address) {
      return NextResponse.json(
        { error: "Campaign address is required" },
        { status: 400 }
      );
    }

    // Use the chain from query param, default to polygon if not specified
    console.log("Chain param:", chainParam); // Debug logging
    
    // Get the appropriate chain based on the parameter
    const activeChain = chainParam === "baseSepolia" ? baseSepolia : polygon;
    
    // Get contract instance for the campaign
    const contract = getContract({
      client,
      chain: activeChain,
      address,
    });

    // Call the getCampaignDetails function using readContract
    const campaignDetailsData = await readContract({
      contract,
      method:
        "function getCampaignDetails() view returns ((address,string,string,string,uint256,uint256,uint256,uint8,address,bool))",
    });

    if (!campaignDetailsData) {
      return NextResponse.json(
        { error: "Campaign details not found" },
        { status: 404 }
      );
    }

    // Format the response
    const campaignDetails = {
      campaignAddress: campaignDetailsData[0],
      name: campaignDetailsData[1],
      description: campaignDetailsData[2],
      imageHash: campaignDetailsData[3],
      goal: Number(campaignDetailsData[4]),
      deadline: Number(campaignDetailsData[5]),
      balance: Number(campaignDetailsData[6]),
      state: Number(campaignDetailsData[7]),
      owner: campaignDetailsData[8],
      isDisabled: campaignDetailsData[9],
    };

    // Return the campaign details
    return NextResponse.json(campaignDetails);
  } catch (error: unknown) {
    console.error("Error fetching campaign details:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch campaign details" },
      { status: 500 }
    );
  }
}
