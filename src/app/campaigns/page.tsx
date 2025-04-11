"use client";

import { useState, useEffect } from "react";
import { CampaignGrid } from "@/components/CampaignGrid";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFactory } from "@/hooks/useFactory";
import { useNetwork } from "@/lib/NetworkContext";
import { Search, SlidersHorizontal, X } from "lucide-react";

// Define campaign data interface
interface CampaignData {
  name: string;
  description: string;
  address: string;
  state: number;
  isDisabled: boolean;
  goal: number;
  balance: number;
  progressPercentage: number;
}

// Campaign states based on the Crowdfunding contract
// enum CampaignState { Active, Successful, Failed }
const campaignStates = [
  { value: 0, label: "Active" },
  { value: 1, label: "Successful" },
  { value: 2, label: "Failed" }
];

export default function AllCampaignsPage() {
  const [selectedStates, setSelectedStates] = useState<number[]>([0]); // Default to showing active
  const [searchTerm, setSearchTerm] = useState("");
  const [fundingRange, setFundingRange] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredCampaignAddresses, setFilteredCampaignAddresses] = useState<string[]>([]);
  const [includeDisabled, setIncludeDisabled] = useState(false);
  
  const { campaignAddresses, isLoading } = useFactory();
  const { network } = useNetwork();
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);

  // Fetch all campaign details for search and filtering
  useEffect(() => {
    if (!isLoading && campaignAddresses) {
      const fetchCampaignDetails = async () => {
        const details = await Promise.all(
          campaignAddresses.map(async (address) => {
            try {
              const response = await fetch(
                `/api/campaign-details?address=${address}&chain=${network}`
              );
              if (!response.ok) return null;
              
              const data = await response.json();
              return {
                ...data,
                address,
                // Calculate funding progress percentage
                progressPercentage: data.goal > 0 
                  ? Math.min(100, (data.balance / data.goal) * 100) 
                  : 0
              } as CampaignData;
            } catch (error) {
              console.error(`Error fetching details for ${address}:`, error);
              return null;
            }
          })
        );
        
        // Filter out null values
        const validDetails = details.filter((detail): detail is CampaignData => detail !== null);
        setCampaignData(validDetails);
      };
      
      fetchCampaignDetails();
    }
  }, [campaignAddresses, isLoading, network]);

  // Apply filters and search
  useEffect(() => {
    if (campaignData.length > 0) {
      let filtered = [...campaignData];
      
      // Filter by campaign state
      if (selectedStates.length > 0) {
        filtered = filtered.filter(campaign => 
          selectedStates.includes(campaign.state)
        );
      }

      // Filter out disabled campaigns unless includeDisabled is true
      if (!includeDisabled) {
        filtered = filtered.filter(campaign => !campaign.isDisabled);
      }
      
      // Apply search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          campaign => 
            campaign.name?.toLowerCase().includes(term) || 
            campaign.description?.toLowerCase().includes(term)
        );
      }
      
      // Apply funding range filter
      filtered = filtered.filter(campaign => 
        campaign.progressPercentage >= fundingRange[0] && 
        campaign.progressPercentage <= fundingRange[1]
      );
      
      // Extract addresses for CampaignGrid
      setFilteredCampaignAddresses(filtered.map(campaign => campaign.address));
    }
  }, [searchTerm, selectedStates, fundingRange, includeDisabled, campaignData]);

  // Toggle state selection
  const toggleState = (state: number) => {
    setSelectedStates(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state) 
        : [...prev, state]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStates([0]); // Reset to Active state
    setFundingRange([0, 100]);
    setIncludeDisabled(false);
  };

  const hasActiveFilters = 
    searchTerm || 
    (selectedStates.length !== 1 || selectedStates[0] !== 0) || 
    fundingRange[0] > 0 || 
    fundingRange[1] < 100 || 
    includeDisabled;

  // Update the heading to reflect selected states
  const getPageHeading = () => {
    if (selectedStates.length === 0) return "All Campaigns";
    if (selectedStates.length === campaignStates.length) return "All Campaigns";
    
    if (selectedStates.length === 1) {
      const status = campaignStates.find(s => s.value === selectedStates[0]);
      return status ? `${status.label} Campaigns` : "Campaigns";
    }
    
    // If multiple states are selected but not all
    return "Filtered Campaigns";
  };

  return (
    <main className="container mx-auto py-12">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{getPageHeading()}</h1>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="Search campaigns by name or description..."
            className="pl-10 pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className="bg-card border rounded-lg p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Campaign Status</h3>
              <div className="flex flex-wrap gap-2">
                {campaignStates.map((state) => (
                  <Badge 
                    key={state.value}
                    variant={selectedStates.includes(state.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleState(state.value)}
                  >
                    {state.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <h3 className="text-sm font-medium">Funding Progress</h3>
                <span className="text-xs text-muted-foreground">
                  {fundingRange[0]}% - {fundingRange[1]}%
                </span>
              </div>
              <Slider
                value={fundingRange}
                min={0}
                max={100}
                step={5}
                onValueChange={setFundingRange}
              />
            </div>

            <div className="flex items-center space-x-2">
              <label htmlFor="include-disabled" className="text-sm font-medium cursor-pointer">
                Include Disabled Campaigns
              </label>
              <input
                id="include-disabled"
                type="checkbox"
                checked={includeDisabled}
                onChange={(e) => setIncludeDisabled(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
            
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="mt-8">
        {filteredCampaignAddresses.length > 0 ? (
          <CampaignGrid 
            campaignAddresses={filteredCampaignAddresses} 
            showAll={true} // Since we're handling filtering at this level now
          />
        ) : isLoading ? (
          <CampaignGrid showAll={false} />
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No campaigns match your search criteria.
            </p>
            {hasActiveFilters && (
              <Button 
                variant="link" 
                onClick={clearFilters} 
                className="mt-2"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
