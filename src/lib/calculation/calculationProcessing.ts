import { BoardItem } from "@/lib/types";
import { CalculationToken } from "@/types/calculation";
import { toast } from "sonner";
import { fetchFromMonday } from "../api/mondayApiClient";
import { evaluateFormulaForItem } from "./formulaEvaluation";

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

/**
 * Process items with the Hebrew columns specific formula
 */
const processSpecificHebrewFormula = async (
  items: BoardItem[],
  setProcessedItems: (count: number) => void
) => {
  let validItems = 0;
  let successCount = 0;
  const results: {id: string, name: string, result: number | string}[] = [];
  
  // Get the credentials for API updates
  const credsStr = sessionStorage.getItem("mondayCredentials");
  if (!credsStr) {
    toast.error("No Monday.com credentials found");
    return;
  }
  
  const credentials = JSON.parse(credsStr);
  
  // Process only the first item for debug
  if (items.length > 0) {
    const item = items[0];
    setProcessedItems(1);
    
    try {
      const accountValue = parseFloat(item.columns["numeric_mkpv862j"]?.text || "0");
      const receiptValue = parseFloat(item.columns["numeric_mkpv3cnz"]?.text || "0");
      
      if (isNaN(accountValue) || isNaN(receiptValue)) {
        results.push({
          id: item.id,
          name: item.name,
          result: "Invalid number values"
        });
      } else {
        validItems++;
        const difference = accountValue - receiptValue;
        
        // Update the target column with the difference
        // For debug, we'll use a specific column (numeric_mkpvgf7j - ח. פנימי)
        const targetColumnId = "numeric_mkpvgf7j";
        const boardId = credentials.sourceBoard;
        
        // Call the Monday API to update the column with board_id
        const updateSuccess = await updateColumnValue(
          item.id, 
          boardId,
          targetColumnId, 
          difference.toString(),
          credentials.apiToken
        );
        
        if (updateSuccess) {
          successCount++;
          results.push({
            id: item.id,
            name: item.name,
            result: difference
          });
        } else {
          results.push({
            id: item.id,
            name: item.name,
            result: "Failed to update column"
          });
        }
      }
    } catch (error) {
      console.error(`Error processing item ${item.name}:`, error);
      results.push({
        id: item.id,
        name: item.name,
        result: error instanceof Error ? error.message : "Error"
      });
    }
  }
  
  // Generate the summary message
  generateSummaryMessage(1, successCount, 1 - successCount, 0, results);
};

/**
 * Process items with user-defined generic formula
 */
const processGenericFormula = async (
  items: BoardItem[],
  formula: CalculationToken[],
  targetColumn: any,
  setProcessedItems: (count: number) => void
) => {
  // Get the credentials for API updates
  const credsStr = sessionStorage.getItem("mondayCredentials");
  if (!credsStr) {
    toast.error("No Monday.com credentials found");
    return;
  }
  
  const credentials = JSON.parse(credsStr);
  const boardId = credentials.sourceBoard;
  
  // For debug, only process the first item
  if (items.length > 0) {
    const item = items[0];
    const results: {id: string, name: string, result: number | string}[] = [];
    let successCount = 0;
    
    try {
      // Check if the item has all required columns for formula
      let isValid = true;
      let invalidReason = "";
      
      // Validate the formula can be applied to this item
      formula.forEach(token => {
        if (token.type === "column") {
          const columnExists = item.columns[token.id];
          if (!columnExists) {
            isValid = false;
            invalidReason = `Missing column: ${token.display}`;
            return;
          }
          
          // Check if column value can be parsed as a number
          const textValue = columnExists.text || "";
          const numValue = parseFloat(textValue);
          if (isNaN(numValue)) {
            isValid = false;
            invalidReason = `Column "${token.display}" value "${textValue}" is not a number`;
            return;
          }
        }
      });
      
      if (!isValid) {
        results.push({
          id: item.id,
          name: item.name,
          result: invalidReason
        });
      } else {
        // Calculate the result using the formula
        const result = evaluateFormulaForItem(formula, item);
        
        // Update the target column with the result
        if (typeof result === "number") {
          const updateSuccess = await updateColumnValue(
            item.id,
            boardId,
            targetColumn.id, 
            result.toString(),
            credentials.apiToken
          );
          
          if (updateSuccess) {
            successCount++;
          }
        }
        
        results.push({
          id: item.id,
          name: item.name,
          result: result
        });
      }
      
      // Update progress
      setProcessedItems(1);
      
      // Generate summary message for just this one item
      generateSummaryMessage(1, successCount, 1 - successCount, 0, results);
      
    } catch (error) {
      console.error(`Error processing item ${item.name}:`, error);
      results.push({
        id: item.id,
        name: item.name,
        result: error instanceof Error ? error.message : "Error"
      });
      
      // Generate error summary
      generateSummaryMessage(1, 0, 1, 0, results);
    }
  } else {
    toast.error("No items found to process");
  }
};

/**
 * Update a column value in Monday.com
 * @param itemId The ID of the item to update
 * @param boardId The ID of the board containing the item
 * @param columnId The ID of the column to update
 * @param value The new value for the column
 * @param apiToken The Monday.com API token
 * @returns A promise that resolves to true if the update was successful
 */
const updateColumnValue = async (
  itemId: string, 
  boardId: string,
  columnId: string, 
  value: string, 
  apiToken: string
): Promise<boolean> => {
  try {
    // Show updating toast
    toast.loading(`Updating column value for item ${itemId}...`, { id: `update-${itemId}` });
    
    // Prepare the mutation query with board_id parameter
    const mutation = `
      mutation {
        change_column_value(
          item_id: ${itemId},
          board_id: ${boardId},
          column_id: "${columnId}",
          value: "${value}"
        ) {
          id
        }
      }
    `;
    
    console.log(`Updating item ${itemId}, board ${boardId}, column ${columnId} with value: ${value}`);
    
    // Call the Monday API
    const response = await fetchFromMonday(mutation, apiToken);
    
    if (response?.data?.change_column_value?.id) {
      toast.success(`Updated item ${itemId}`, { 
        id: `update-${itemId}`,
        description: `Column ${columnId} set to ${value}`
      });
      return true;
    } else {
      console.error("Failed to update column value:", response);
      toast.error(`Failed to update item ${itemId}`, { 
        id: `update-${itemId}`,
        description: `Check console for details`
      });
      return false;
    }
  } catch (error) {
    console.error("Error updating column value:", error);
    toast.error(`Error updating item ${itemId}`, { 
      id: `update-${itemId}`,
      description: error instanceof Error ? error.message : "An unknown error occurred"
    });
    return false;
  }
};

/**
 * Generate a summary message for the processing results
 */
const generateSummaryMessage = (
  processedCount: number,
  successCount: number,
  failureCount: number,
  skippedCount: number,
  results: {id: string, name: string, result: number | string}[]
) => {
  let summaryMessage = `Processed ${processedCount} items:\n`;
  summaryMessage += `✅ ${successCount} calculations successful\n`;
  summaryMessage += `❌ ${failureCount} calculations failed\n`;
  
  if (skippedCount > 0) {
    summaryMessage += `⚠️ ${skippedCount} items skipped (missing or invalid data)\n`;
  }
  
  // Show some example results
  const exampleCount = Math.min(5, results.length);
  if (exampleCount > 0) {
    summaryMessage += "\nExample results:\n";
    for (let i = 0; i < exampleCount; i++) {
      const result = results[i];
      summaryMessage += `- ${result.name}: ${result.result}\n`;
    }
  }
  
  // Show the results
  toast.success("Board processing complete", {
    description: summaryMessage,
    duration: 10000
  });
};
