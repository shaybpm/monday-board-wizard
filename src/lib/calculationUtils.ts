
/**
 * Utility functions for calculation operations
 */

import { BoardItem } from "@/lib/types";
import { CalculationToken } from "@/types/calculation";
import { toast } from "sonner";
import { fetchFromMonday } from "./api/mondayApiClient";

/**
 * Evaluates a formula for a specific board item
 */
export const evaluateFormulaForItem = (formula: CalculationToken[], item: BoardItem): number | string => {
  let evaluationString = "";
  
  try {
    formula.forEach(token => {
      if (token.type === "column") {
        const columnValue = item.columns[token.id];
        if (!columnValue || !columnValue.text) {
          throw new Error(`Column ${token.display} has no value for item ${item.name}`);
        }
        
        // Try to convert column value to number
        const numValue = parseFloat(columnValue.text);
        if (isNaN(numValue)) {
          throw new Error(`Column ${token.display} value "${columnValue.text}" is not a number`);
        }
        evaluationString += numValue;
      } else if (token.type === "number") {
        evaluationString += token.value;
      } else if (token.type === "operator") {
        evaluationString += token.value;
      }
    });
    
    // Evaluate the formula
    const result = new Function(`return ${evaluationString}`)();
    
    if (isNaN(result)) {
      return "NaN";
    }
    
    return result;
  } catch (error) {
    console.error(`Error evaluating formula for item ${item.name}:`, error);
    return error instanceof Error ? error.message : "Error";
  }
};

/**
 * Tests the calculation with real data from the first item in the board
 */
export const testCalculationFormula = async (formula: CalculationToken[]) => {
  try {
    // Get credentials from session storage
    const credsStr = sessionStorage.getItem("mondayCredentials");
    if (!credsStr) {
      toast.error("No Monday.com credentials found");
      return null;
    }
    
    const credentials = JSON.parse(credsStr);
    const boardId = credentials.sourceBoard || "1909452712"; // Use specified board ID
    
    // If formula is empty, we'll perform the specific calculation requested
    if (!formula || formula.length === 0) {
      // Fetch the first item from the specified board
      const query = `
        query {
          boards(ids: ${boardId}) {
            items_page(limit: 1) {
              items {
                id
                name
                column_values {
                  id
                  title
                  text
                  value
                  type
                }
              }
            }
          }
        }
      `;
      
      toast.info("Fetching data from Monday.com...");
      
      const response = await fetchFromMonday(query, credentials.apiToken);
      
      if (!response?.data?.boards?.[0]?.items_page?.items?.[0]) {
        toast.error("No items found in the specified board");
        return null;
      }
      
      const firstItem = response.data.boards[0].items_page.items[0];
      
      // Find the specified columns (סכום בחשבון, סכום בתקבול)
      const amountInAccountColumn = firstItem.column_values.find(
        col => col.title === "סכום בחשבון" || col.id.includes("סכום_בחשבון")
      );
      
      const amountInReceiptColumn = firstItem.column_values.find(
        col => col.title === "סכום בתקבול" || col.id.includes("סכום_בתקבול")
      );
      
      if (!amountInAccountColumn || !amountInReceiptColumn) {
        toast.error("Could not find the specified columns", {
          description: "Looking for 'סכום בחשבון' and 'סכום בתקבול' columns"
        });
        
        // Log all available columns to help debug
        const availableColumns = firstItem.column_values.map(col => `${col.title} (${col.id})`).join(", ");
        console.log("Available columns:", availableColumns);
        
        return null;
      }
      
      // Parse the values and calculate difference
      const accountValue = parseFloat(amountInAccountColumn.text || "0");
      const receiptValue = parseFloat(amountInReceiptColumn.text || "0");
      
      if (isNaN(accountValue) || isNaN(receiptValue)) {
        toast.error("Column values are not valid numbers", {
          description: `Account: ${amountInAccountColumn.text}, Receipt: ${amountInReceiptColumn.text}`
        });
        return null;
      }
      
      const difference = accountValue - receiptValue;
      
      // Create calculation display
      let calculation = `Calculation for item "${firstItem.name}":\n`;
      calculation += `סכום בחשבון = ${accountValue}\n`;
      calculation += `סכום בתקבול = ${receiptValue}\n`;
      calculation += `\nDifference = ${difference}`;
      
      toast.success("Calculation successful!", {
        description: calculation,
        duration: 5000
      });
      
      return difference.toString();
    } else {
      // Original implementation with provided formula
      // Get board data from session storage
      const boardDataStr = sessionStorage.getItem("mondayBoardData");
      if (!boardDataStr) {
        toast.error("No board data available for testing");
        return null;
      }
      
      const boardData = JSON.parse(boardDataStr);
      
      // Check if we have any items
      if (!boardData.items || boardData.items.length === 0) {
        toast.error("No items available for testing");
        return null;
      }
      
      // Get the first item for testing
      const firstItem = boardData.items[0];
      
      // Check if the first item has all required columns
      const missingColumns: string[] = [];
      formula.forEach(token => {
        if (token.type === "column") {
          if (!firstItem.columns[token.id] || !firstItem.columns[token.id].text) {
            missingColumns.push(token.display);
          }
        }
      });
      
      if (missingColumns.length > 0) {
        toast.error("First item is missing required columns", {
          description: `Missing columns: ${missingColumns.join(", ")}`
        });
        return null;
      }
      
      // Create a human-readable representation of the calculation with first item values
      let calculation = `Test calculation using first item "${firstItem.name}":\n`;
      
      // Evaluate the formula for the first item
      const result = evaluateFormulaForItem(formula, firstItem);
      
      // Build the calculation display string with actual values
      formula.forEach(token => {
        if (token.type === "column") {
          const columnValue = firstItem.columns[token.id];
          const displayValue = columnValue.text || "N/A";
          calculation += `${token.display} = ${displayValue}\n`;
        }
      });
      
      calculation += `\nResult = ${result}`;
      
      if (typeof result === "string" && result.startsWith("Error")) {
        toast.error("Calculation error", {
          description: result,
          duration: 5000
        });
        return null;
      } else {
        toast.success("Test successful!", {
          description: calculation,
          duration: 5000
        });
        
        return result.toString();
      }
    }
  } catch (error) {
    console.error("Test calculation error:", error);
    toast.error("Test failed", {
      description: error instanceof Error ? error.message : "An error occurred while testing the calculation."
    });
    return null;
  }
};

/**
 * Processes board data using the provided formula and target column
 */
export const processBoardData = (
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
    if (!boardData || !boardData.items || !targetColumn) {
      toast.error("Missing data", {
        description: "Board data or target column is missing."
      });
      setIsCalculating(false);
      return;
    }

    const items = boardData.items;
    setTotalItems(items.length);
    
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
    
    // Generate the summary message
    let summaryMessage = `Processed ${validItems.length} items:\n`;
    summaryMessage += `✅ ${successCount} calculations successful\n`;
    summaryMessage += `❌ ${validItems.length - successCount} calculations failed\n`;
    
    if (invalidItems.length > 0) {
      summaryMessage += `⚠️ ${invalidItems.length} items skipped (missing or invalid data)\n`;
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
