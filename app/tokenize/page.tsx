"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CubeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Property } from "~~/types/property";

const Tokenize: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenizingProperty, setTokenizingProperty] = useState<string | null>(null);
  const [tokenizedProperties, setTokenizedProperties] = useState<Set<string>>(new Set());

  // Load properties from API
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Only load properties that are not yet tokenized
      const params = new URLSearchParams({
        status: 'active'
      });

      const response = await fetch(`/api/properties?${params}`);
      const data = await response.json();

      if (data.success) {
        setProperties(data.data || []);
      } else {
        setError(data.error || 'Failed to load properties');
      }
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tokenizing property
  const handleTokenizeProperty = async (propertyId: string) => {
    if (!connectedAddress) {
      alert("Please connect your wallet first");
      return;
    }

    setTokenizingProperty(propertyId);
    try {
      // TODO: Implement actual smart contract interaction
      console.log("Tokenizing property:", propertyId);

      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mark property as tokenized
      setTokenizedProperties(prev => new Set([...prev, propertyId]));

      console.log("Property tokenized successfully!");
    } catch (error) {
      console.error("Error tokenizing property:", error);
      alert("Failed to tokenize property. Please try again.");
    } finally {
      setTokenizingProperty(null);
    }
  };

  // Check if property is tokenized
  const isPropertyTokenized = (propertyId: string) => {
    return tokenizedProperties.has(propertyId);
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/20 rounded-full">
              <CubeIcon className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-base-content mb-4">
            Tokenize Properties
          </h1>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            Convert your real estate properties into blockchain tokens for fractional ownership and investment
          </p>
          {!connectedAddress && (
            <div className="mt-8 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-warning">Please connect your wallet to tokenize properties</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Tokenize;