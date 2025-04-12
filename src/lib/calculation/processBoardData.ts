
import { BoardItem } from "@/lib/types";
import { CalculationToken } from "@/types/calculation";
import { toast } from "sonner";
import { fetchFromMonday } from "../api/mondayApiClient";
import { processGenericFormula } from "./processGenericFormula";
import { processSpecificHebrewFormula } from "./processSpecificHebrewFormula";
import { fetchAllItemsWithPagination } from "../api/paginationApi";

/**
 * Processes board data using the provided formula and target column
 */
export const processBoardData = async (
  boardData: any,
  formula: CalculationToken[],
  targetColumn: any,
  setIsCalculating: (state: boolean) => void,
  setProcessedItems: (count: number) => void,
  setTotalItems: (count: number) => void
) => {
  setIsCalculating(true);
  setProcessedItems(0);
  
  try {
    // Check if we have a target column
    if (!targetColumn) {
      toast.error("Target column is missing", {
        description: "Please select a target column for the calculation result."
      });
      setIsCalculating(false);
      return;
    }
    
    // If boardData doesn't have items or has empty items array, fetch them directly with pagination
    let processableData = boardData;
    if (!boardData || !boardData.items || boardData.items.length === 0) {
      processableData = await fetchBoardDataFromAPIWithPagination();
      if (!processableData) {
        setIsCalculating(false);
        return;
      }
    }

    // Now proceed with processing the items
    const items = processableData.items;
    setTotalItems(items.length);
    
    // Check if we should use the specific formula for Hebrew columns
    const useSpecificFormula = !formula || formula.length === 0;
    
    if (useSpecificFormula) {
      await processSpecificHebrewFormula(items, setProcessedItems);
    } else {
      await processGenericFormula(items, formula, targetColumn, setProcessedItems);
    }
  } catch (error) {
    toast.error("Processing error", {
      description: error instanceof Error ? error.message : "An error occurred while processing board data."
    });
  } finally {
    setIsCalculating(false);
    setProcessedItems(0);
    setTotalItems(0);
  }
};

/**
 * Fetches board data from Monday.com API with pagination
 */
const fetchBoardDataFromAPIWithPagination = async () => {
  const credsStr = sessionStorage.getItem("mondayCredentials");
  if (!credsStr) {
    toast.error("No Monday.com credentials found");
    return null;
  }
  
  const credentials = JSON.parse(credsStr);
  
  // Show a loading toast
  toast.loading("Fetching all board items with pagination...", { id: "process-board" });
  
  try {
    // Use the pagination API to fetch all items
    const allItems = await fetchAllItemsWithPagination(credentials);
    
    if (!allItems || allItems.length === 0) {
      toast.error("No items found in the board", { 
        id: "process-board",
        description: "Board ID: " + credentials.sourceBoard
      });
      return null;
    }
    
    // Convert API response to our format
    const items = allItems.map((item: any) => {
      const formattedItem: BoardItem = {
        id: item.id,
        name: item.name,
        groupId: item.group?.id || "",
        groupTitle: item.group?.title || "",
        type: 'item',
        columns: {}
      };
      
      // Add all columns to our formatted item
      item.column_values.forEach((col: any) => {
        formattedItem.columns[col.id] = {
          id: col.id,
          title: col.title || col.id,
          type: col.type,
          value: col.value,
          text: col.text
        };
      });
      
      return formattedItem;
    });
    
    // Update boardData with the fetched items
    const updatedBoardData = {
      items: items
    };
    
    // Success toast
    toast.success(`Fetched all ${items.length} items from the board`, { 
      id: "process-board"
    });
    
    return updatedBoardData;
  } catch (error) {
    console.error("Error fetching board items:", error);
    toast.error("Failed to fetch board items", { 
      id: "process-board",
      description: error instanceof Error ? error.message : "An unknown error occurred"
    });
    return null;
  }
};
