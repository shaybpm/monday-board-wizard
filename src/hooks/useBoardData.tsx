
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ParsedBoardData } from "@/lib/types";
import { fetchBoardStructure } from "@/lib/mondayAPI";

export const useBoardData = () => {
  const [boardData, setBoardData] = useState<ParsedBoardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadBoardData = async () => {
    setIsLoading(true);
    const storedCredentialsStr = sessionStorage.getItem("mondayCredentials");
    
    if (!storedCredentialsStr) {
      toast.error("No credentials found. Please connect to Monday.com first.");
      navigate("/");
      return;
    }

    try {
      const credentials = JSON.parse(storedCredentialsStr);
      const fetchedBoardData = await fetchBoardStructure(credentials);
      
      if (fetchedBoardData) {
        if (!fetchedBoardData.subitems) {
          fetchedBoardData.subitems = [];
        }
        
        setBoardData(fetchedBoardData);
        sessionStorage.setItem("mondayBoardData", JSON.stringify(fetchedBoardData));
      } else {
        toast.error("Failed to refresh board data.");
      }
    } catch (error) {
      console.error("Error refreshing board data:", error);
      toast.error("Error loading board data. Please reconnect to Monday.com.");
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBoardData();
  }, [navigate]);

  return {
    boardData,
    setBoardData,
    isLoading,
    loadBoardData
  };
};
