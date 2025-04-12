
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
  
  // Process each item with the specific calculation (account - receipt)
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    setProcessedItems(i + 1);
    
    try {
      const accountValue = parseFloat(item.columns["numeric_mkpv862j"]?.text || "0");
      const receiptValue = parseFloat(item.columns["numeric_mkpv3cnz"]?.text || "0");
      
      if (isNaN(accountValue) || isNaN(receiptValue)) {
        results.push({
          id: item.id,
          name: item.name,
          result: "Invalid number values"
        });
        continue;
      }
      
      validItems++;
      const difference = accountValue - receiptValue;
      results.push({
        id: item.id,
        name: item.name,
        result: difference
      });
      successCount++;
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
  generateSummaryMessage(items.length, successCount, items.length - successCount, 0, results);
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
  // Count items that can be processed (have all required columns)
  const validItems: BoardItem[] = [];
  const invalidItems: {item: BoardItem, reason: string}[] = [];
  
  // First pass: validate all items
  items.forEach((item: BoardItem) => {
    let isValid = true;
    let invalidReason = "";
    
    // Check if the item has all required columns from the formula
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
    
    // Also check if target column exists in the item
    if (!item.columns[targetColumn.id]) {
      isValid = false;
      invalidReason = `Target column "${targetColumn.title}" does not exist in this item`;
    }
    
    if (isValid) {
      validItems.push(item);
    } else {
      invalidItems.push({item, reason: invalidReason});
    }
  });
  
  // Log validation results
  console.log(`Valid items: ${validItems.length}, Invalid items: ${invalidItems.length}`);
  
  // Second pass: process valid items
  const results: {id: string, name: string, result: number | string}[] = [];
  let successCount = 0;
  
  validItems.forEach((item, index) => {
    try {
      const result = evaluateFormulaForItem(formula, item);
      results.push({
        id: item.id,
        name: item.name,
        result: result
      });
      
      if (typeof result === "number") {
        successCount++;
      }
      
      // Update progress
      setProcessedItems(index + 1);
    } catch (error) {
      console.error(`Error processing item ${item.name}:`, error);
      results.push({
        id: item.id,
        name: item.name,
        result: error instanceof Error ? error.message : "Error"
      });
    }
  });
  
  // Generate summary message
  generateSummaryMessage(
    validItems.length, 
    successCount, 
    validItems.length - successCount,
    invalidItems.length,
    results
  );
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
