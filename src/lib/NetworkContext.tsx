"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { polygon, baseSepolia } from "thirdweb/chains";

// Network type
export type NetworkType = "polygon" | "baseSepolia";

// Network config interface
interface NetworkConfig {
  chain: typeof polygon | typeof baseSepolia;
  factoryAddress: string;
  name: string;
  currency: string;
  explorerUrl: string;
}

// Network configuration
export const NETWORKS: Record<NetworkType, NetworkConfig> = {
  polygon: {
    chain: polygon,
    factoryAddress: process.env.NEXT_PUBLIC_CROWDFUNDING_FACTORY_POL!,
    name: "Polygon",
    currency: "POL",
    explorerUrl: "https://polygonscan.com",
  },
  baseSepolia: {
    chain: baseSepolia,
    factoryAddress: process.env.NEXT_PUBLIC_CROWDFUNDING_FACTORY_SEPOLIA!,
    name: "Base Sepolia",
    currency: "ETH",
    explorerUrl: "https://sepolia.basescan.org",
  },
};

// Create context with default values
interface NetworkContextType {
  network: NetworkType;
  setNetwork: (network: NetworkType) => void;
  activeChain: typeof polygon | typeof baseSepolia;
  factoryAddress: string;
  currencySymbol: string;
}

const NetworkContext = createContext<NetworkContextType>({
  network: "polygon",
  setNetwork: () => {},
  activeChain: polygon,
  factoryAddress: NETWORKS.polygon.factoryAddress,
  currencySymbol: NETWORKS.polygon.currency,
});

// Network provider component
export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  // Initialize from localStorage if available, otherwise default to polygon
  const [network, setNetworkState] = useState<NetworkType>("polygon");

  useEffect(() => {
    // Get saved network from localStorage
    const savedNetwork = localStorage.getItem("preferredNetwork") as NetworkType;
    if (savedNetwork && NETWORKS[savedNetwork]) {
      setNetworkState(savedNetwork);
    }
  }, []);

  // Update localStorage when network changes
  const setNetwork = (newNetwork: NetworkType) => {
    setNetworkState(newNetwork);
    localStorage.setItem("preferredNetwork", newNetwork);
    
    // Also set a cookie for server components
    document.cookie = `preferredNetwork=${newNetwork}; path=/; max-age=31536000; SameSite=Lax`;
  };

  // Prepare context value
  const contextValue = {
    network,
    setNetwork,
    activeChain: NETWORKS[network].chain,
    factoryAddress: NETWORKS[network].factoryAddress,
    currencySymbol: NETWORKS[network].currency,
  };

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
};

// Custom hook to use the network context
export const useNetwork = () => useContext(NetworkContext); 