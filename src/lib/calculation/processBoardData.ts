
import { BoardItem } from "@/lib/types";
import { CalculationToken } from "@/types/calculation";
import { toast } from "sonner";
import { fetchFromMonday } from "../api/mondayApiClient";
import { processGenericFormula } from "./processGenericFormula";
import { processSpecificHebrewFormula } from "./processSpecificHebrewFormula";

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
    
    // If boardData doesn't have items or has empty items array, fetch them directly
    let processableData = boardData;
    if (!boardData || !boardData.items || boardData.items.length === 0) {
      processableData = await fetchBoardDataFromAPI();
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
 * Fetches board data from Monday.com API
 */
const fetchBoardDataFromAPI = async () => {
  const credsStr = sessionStorage.getItem("mondayCredentials");
  if (!credsStr) {
    toast.error("No Monday.com credentials found");
    return null;
  }
  
  const credentials = JSON.parse(credsStr);
  const boardId = credentials.sourceBoard || "1909452712"; // Use specified board ID or fallback
  
  // Show a loading toast
  toast.loading("Fetching board items...", { id: "process-board" });
  
  // Fetch items from Monday.com API (similar to test function)
  const query = `
    query {
      boards(ids: ${boardId}) {
        items_page(limit: 100) {
          items {
            id
            name
            column_values {
              id
              text
              value
              type
            }
          }
        }
      }
    }
  `;
  
  try {
    const response = await fetchFromMonday(query, credentials.apiToken);
    
    if (!response?.data?.boards?.[0]?.items_page?.items) {
      toast.error("No items found in the board", { 
        id: "process-board",
        description: "Board ID: " + boardId
      });
      return null;
    }
    
    // Convert API response to our format
    const apiItems = response.data.boards[0].items_page.items;
    const items = apiItems.map((item: any) => {
      const formattedItem: BoardItem = {
        id: item.id,
        name: item.name,
        groupId: "",
        groupTitle: "",
        type: 'item',
        columns: {}
      };
      
      // Add all columns to our formatted item
      item.column_values.forEach((col: any) => {
        formattedItem.columns[col.id] = {
          id: col.id,
          title: col.id, // Using column ID as title since title is not available
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
    toast.success(`Fetched ${items.length} items from the board`, { 
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
