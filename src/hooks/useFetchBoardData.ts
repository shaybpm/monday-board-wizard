
import { useState } from "react";
import { toast } from "sonner";
import { ParsedBoardData } from "@/lib/types";
import { fetchBoardStructureWithExamples } from "@/lib/mondayAPI";
import { fetchAllItemsWithPagination, fetchAllSubitemsWithPagination } from "@/lib/api/paginationApi";
import { transformBoardData } from "@/lib/transformers/boardDataTransformer";

interface FetchProgressState {
  items: number;
  subitems: number;
}

export const useFetchBoardData = (
  setBoardData: React.Dispatch<React.SetStateAction<ParsedBoardData | null>>
) => {
  const [isFetching, setIsFetching] = useState(false);
  const [progress, setProgress] = useState<FetchProgressState>({
    items: 0,
    subitems: 0
  });

  const fetchAllBoardData = async () => {
    setIsFetching(true);
    setProgress({ items: 0, subitems: 0 });
    toast.info("Starting to fetch all board data...");
    
    const storedCredentialsStr = sessionStorage.getItem("mondayCredentials");
    
    if (!storedCredentialsStr) {
      toast.error("No credentials found. Please connect to Monday.com first.");
      setIsFetching(false);
      return;
    }
    
    try {
      const credentials = JSON.parse(storedCredentialsStr);
      
      // First fetch board structure
      const fetchedBoardData = await fetchBoardStructureWithExamples(credentials);
      
      if (fetchedBoardData) {
        // Then fetch all items with pagination
        const items = await fetchAllItemsWithPagination(credentials);
        setProgress(prev => ({ ...prev, items: items.length }));
        
        if (items.length === 0) {
          toast.warning("No items found in the board.");
        }
        
        // Find items that have subitems
        const itemsWithSubitems = items
          .filter(item => item.subitems && item.subitems.length > 0)
          .map(item => item.id);
        
        console.log(`Found ${itemsWithSubitems.length} items with subitems`);
        
        let subitems: any[] = [];
        
        // Fetch all subitems for those items
        if (itemsWithSubitems.length > 0) {
          subitems = await fetchAllSubitemsWithPagination(credentials, itemsWithSubitems);
          setProgress(prev => ({ ...prev, subitems: subitems.length }));
          
          if (subitems.length === 0) {
            toast.warning("No subitems found despite items having subitem references.");
          }
        } else {
          console.log("No items with subitems found");
        }
        
        // Log summary data
        const summary = {
          boardName: fetchedBoardData.boardName,
          totalItems: items.length,
          totalSubitems: subitems.length,
          columns: fetchedBoardData.columns.length,
          subitemColumns: fetchedBoardData.subitemColumns?.length || 0
        };
        
        console.log("Board data summary:", summary);
        
        // Transform and set updated board data
        const updatedBoardData = transformBoardData(fetchedBoardData, items, subitems);
        
        console.log("Setting updated board data:", {
          itemCount: updatedBoardData.items.length,
          subitemCount: updatedBoardData.subitems.length
        });
        
        setBoardData(updatedBoardData);
        sessionStorage.setItem("mondayBoardData", JSON.stringify(updatedBoardData));
        toast.success(`Successfully updated board data with ${updatedBoardData.items.length} items and ${updatedBoardData.subitems.length} subitems.`);
      } else {
        toast.error("Failed to fetch board data.");
      }
    } catch (error) {
      console.error("Error fetching all board data:", error);
      toast.error("Error fetching all board data. Please try again.");
    } finally {
      setIsFetching(false);
      setProgress({ items: 0, subitems: 0 });
    }
  };

  return {
    fetchAllBoardData,
    isFetching,
    progress
  };
};
