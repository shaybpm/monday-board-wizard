
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ParsedBoardData } from "@/lib/types";
import { fetchBoardStructureWithExamples } from "@/lib/mondayAPI";

export const useBoardData = () => {
  const [boardData, setBoardData] = useState<ParsedBoardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadBoardData = useCallback(async () => {
    setIsLoading(true);
    setLoadingError(null);
    console.log("Attempting to load board data...");
    
    // First check if we already have cached board data
    const cachedDataStr = sessionStorage.getItem("mondayBoardData");
    if (cachedDataStr) {
      try {
        const cachedData = JSON.parse(cachedDataStr);
        if (cachedData && cachedData.boardName) {
          console.log("Found cached board data:", cachedData.boardName);
          setBoardData(cachedData);
          setIsLoading(false);
          return cachedData;
        }
      } catch (e) {
        console.error("Error parsing cached board data:", e);
        // Continue to fetch fresh data if cache parsing fails
      }
    }
    
    // No valid cached data, fetch from API
    const storedCredentialsStr = sessionStorage.getItem("mondayCredentials");
    
    if (!storedCredentialsStr) {
      console.error("No credentials found in session storage");
      setLoadingError("No credentials found");
      toast.error("No credentials found. Please connect to Monday.com first.");
      navigate("/");
      setIsLoading(false);
      return null;
    }

    try {
      console.log("Loading board data from API...");
      const credentials = JSON.parse(storedCredentialsStr);
      const fetchedBoardData = await fetchBoardStructureWithExamples(credentials);
      
      if (fetchedBoardData) {
        // Check for cached data with items and subitems
        const cachedDataStr = sessionStorage.getItem("mondayBoardData");
        
        if (cachedDataStr) {
          try {
            const cachedData = JSON.parse(cachedDataStr);
            // If we have cached items data, use it
            if (cachedData.items && cachedData.items.length > 0) {
              fetchedBoardData.items = cachedData.items;
              fetchedBoardData.subitems = cachedData.subitems || [];
              console.log("Restored cached items data:", { 
                itemCount: fetchedBoardData.items.length,
                subitemCount: fetchedBoardData.subitems.length 
              });
            } else {
              // Initialize empty arrays if no cached data
              fetchedBoardData.items = [];
              fetchedBoardData.subitems = [];
            }
          } catch (e) {
            console.error("Error parsing cached board data:", e);
            fetchedBoardData.items = [];
            fetchedBoardData.subitems = [];
          }
        } else {
          // Initialize empty arrays if no cache
          fetchedBoardData.items = [];
          fetchedBoardData.subitems = [];
        }
        
        setBoardData(fetchedBoardData);
        // Make sure we persist the data to session storage
        sessionStorage.setItem("mondayBoardData", JSON.stringify(fetchedBoardData));
        console.log("Board data loaded successfully:", fetchedBoardData.boardName);
        return fetchedBoardData;
      } else {
        console.error("Failed to fetch board data");
        setLoadingError("Failed to fetch board data");
        toast.error("Failed to refresh board data.");
        return null;
      }
    } catch (error) {
      console.error("Error refreshing board data:", error);
      setLoadingError("Error loading board data");
      toast.error("Error loading board data. Please reconnect to Monday.com.");
      navigate("/");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Add a timeout mechanism to prevent infinite loading
  useEffect(() => {
    const loadWithTimeout = async () => {
      // Only try to load if we don't have data and aren't already loading
      if (!boardData && !isLoading) {
        console.log("No board data available, triggering load...");
        
        // Set up a timeout to ensure we don't get stuck loading
        const timeoutId = setTimeout(() => {
          if (isLoading) {
            console.error("Board data loading timed out");
            setIsLoading(false);
            setLoadingError("Loading timed out");
            toast.error("Loading board data timed out. Please try again.");
          }
        }, 15000); // 15 second timeout
        
        await loadBoardData();
        
        // Clear the timeout if we finished loading
        clearTimeout(timeoutId);
      }
    };
    
    loadWithTimeout();
  }, [boardData, loadBoardData, isLoading]);

  return {
    boardData,
    setBoardData,
    isLoading,
    loadingError,
    loadBoardData
  };
};
