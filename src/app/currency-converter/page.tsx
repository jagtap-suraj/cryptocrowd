"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRightLeft } from "lucide-react";
import { useNetwork } from "@/lib/NetworkContext";

// Define interface for conversion rates
interface ConversionRates {
  "POL-USD": number;
  "USD-POL": number;
  "POL-INR": number;
  "INR-POL": number;
  "USD-INR": number;
  "INR-USD": number;
  "ETH-USD": number;
  "USD-ETH": number;
  "ETH-INR": number;
  "INR-ETH": number;
  [key: string]: number;
}

export default function CurrencyConverterPage() {
  const { currencySymbol } = useNetwork();
  const [amount, setAmount] = useState<string>("1");
  const [convertedAmount, setConvertedAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState<string>(currencySymbol);
  const [toCurrency, setToCurrency] = useState<string>("USD");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rates, setRates] = useState<ConversionRates | null>(null);
  const [debouncedAmount, setDebouncedAmount] = useState<string>("1");

  // Update from currency when network changes
  useEffect(() => {
    setFromCurrency(currencySymbol);
    setResult(null);
  }, [currencySymbol]);

  // Debounce the amount input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAmount(amount);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [amount]);

  // Fetch exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Fetch MATIC/POL rates against USD
        const maticResponse = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=matic-network,ethereum&vs_currencies=usd"
        );
        const cryptoData = await maticResponse.json();
        
        // Fetch INR to USD conversion
        const inrResponse = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=inr"
        );
        const inrData = await inrResponse.json();
        
        // Calculate conversion rates
        const usdToInr = inrData.tether.inr; // 1 USD in INR
        const polToUsd = cryptoData["matic-network"].usd; // 1 POL in USD
        const ethToUsd = cryptoData["ethereum"].usd; // 1 ETH in USD
        const polToInr = polToUsd * usdToInr; // 1 POL in INR
        const ethToInr = ethToUsd * usdToInr; // 1 ETH in INR
        
        setRates({
          "POL-USD": polToUsd,
          "USD-POL": 1 / polToUsd,
          "POL-INR": polToInr,
          "INR-POL": 1 / polToInr,
          "USD-INR": usdToInr,
          "INR-USD": 1 / usdToInr,
          "ETH-USD": ethToUsd,
          "USD-ETH": 1 / ethToUsd,
          "ETH-INR": ethToInr,
          "INR-ETH": 1 / ethToInr
        });
        
        setError(null);
      } catch (err) {
        console.error("Error fetching rates:", err);
        setError("Failed to fetch current exchange rates. Please try again later.");
      }
    };
    
    fetchRates();
    // Refresh rates every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Conversion function
  const convertCurrency = useCallback(() => {
    if (!rates) {
      setError("Exchange rates not available. Please try again later.");
      return;
    }
    
    try {
      const numAmount = parseFloat(debouncedAmount);
      if (isNaN(numAmount)) {
        throw new Error("Please enter a valid number");
      }
      
      let convertedResult;
      const rateKey = `${fromCurrency}-${toCurrency}`;
      
      if (fromCurrency === toCurrency) {
        convertedResult = numAmount;
      } else if (rates[rateKey]) {
        convertedResult = numAmount * rates[rateKey];
      } else {
        // If direct conversion not available, convert via USD
        const fromToUsd = fromCurrency === "USD" ? 1 : rates[`${fromCurrency}-USD`];
        const usdToTarget = toCurrency === "USD" ? 1 : rates[`USD-${toCurrency}`];
        convertedResult = numAmount * fromToUsd * usdToTarget;
      }
      
      setResult(convertedResult.toFixed(6));
      setConvertedAmount(debouncedAmount);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResult(null);
    }
  }, [debouncedAmount, fromCurrency, toCurrency, rates]);

  // Convert when debounced amount, fromCurrency, or toCurrency changes
  useEffect(() => {
    if (rates) {
      convertCurrency();
    }
  }, [debouncedAmount, fromCurrency, toCurrency, rates, convertCurrency]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Currency Converter</h1>
      
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <div className="space-y-6">
          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-2">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              step="any"
              min="0"
            />
          </div>
          
          {/* Currency Selection */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            <div className="md:col-span-2">
              <label htmlFor="from-currency" className="block text-sm font-medium mb-2">
                From
              </label>
              <Select
                value={fromCurrency}
                onValueChange={setFromCurrency}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={currencySymbol}>
                    {currencySymbol} {currencySymbol === "POL" ? "(MATIC)" : ""}
                  </SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                  {/* Add the other crypto as an option */}
                  {currencySymbol === "POL" ? (
                    <SelectItem value="ETH">ETH</SelectItem>
                  ) : (
                    <SelectItem value="POL">POL (MATIC)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSwap}
                className="rounded-full"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="to-currency" className="block text-sm font-medium mb-2">
                To
              </label>
              <Select
                value={toCurrency}
                onValueChange={setToCurrency}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={currencySymbol}>
                    {currencySymbol} {currencySymbol === "POL" ? "(MATIC)" : ""}
                  </SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                  {/* Add the other crypto as an option */}
                  {currencySymbol === "POL" ? (
                    <SelectItem value="ETH">ETH</SelectItem>
                  ) : (
                    <SelectItem value="POL">POL (MATIC)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Results */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}
          
          {result && !error && (
            <div className="mt-6 p-6 bg-muted rounded-lg">
              <h3 className="text-lg font-medium mb-2">Conversion Result</h3>
              <div className="text-2xl font-bold">
                {convertedAmount} {fromCurrency} = {result} {toCurrency}
              </div>
              {rates && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Rate: 1 {fromCurrency} = {rates[`${fromCurrency}-${toCurrency}`]?.toFixed(6) || "N/A"} {toCurrency}
                </div>
              )}
            </div>
          )}
          
          {!rates && !error && (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mt-4">
            <p>Data provided by CoinGecko API. Rates are updated every 5 minutes.</p>
            <p>Note: These rates are for informational purposes only and may vary from actual exchange rates.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 