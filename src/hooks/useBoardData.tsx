
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ParsedBoardData } from "@/lib/types";
import { fetchBoardStructureWithExamples } from "@/lib/mondayAPI";

export const useBoardData = () => {
  const [boardData, setBoardData] = useState<ParsedBoardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadBoardData = useCallback(async () => {
    setIsLoading(true);
    const storedCredentialsStr = sessionStorage.getItem("mondayCredentials");
    
    if (!storedCredentialsStr) {
      console.error("No credentials found in session storage");
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
        sessionStorage.setItem("mondayBoardData", JSON.stringify(fetchedBoardData));
        console.log("Board data loaded successfully:", fetchedBoardData.boardName);
        return fetchedBoardData;
      } else {
        console.error("Failed to fetch board data");
        toast.error("Failed to refresh board data.");
        return null;
      }
    } catch (error) {
      console.error("Error refreshing board data:", error);
      toast.error("Error loading board data. Please reconnect to Monday.com.");
      navigate("/");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!boardData) {
      loadBoardData();
    }
  }, [boardData, loadBoardData]);

  return {
    boardData,
    setBoardData,
    isLoading,
    loadBoardData
  };
};
