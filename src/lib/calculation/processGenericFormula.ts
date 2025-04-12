
import { BoardItem } from "@/lib/types";
import { CalculationToken } from "@/types/calculation";
import { toast } from "sonner";
import { evaluateFormulaForItem } from "./formulaEvaluation";
import { updateColumnValue } from "./updateColumnApi";
import { generateSummaryMessage } from "./resultSummary";

/**
 * Process items with user-defined generic formula
 */
export const processGenericFormula = async (
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
  
  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  const results: {id: string, name: string, result: number | string}[] = [];
  
  // Show a processing toast
  toast.loading(`Processing ${items.length} items...`, { id: "process-board-items" });
  
  // Process all items instead of just the first one
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    setProcessedItems(i + 1);
    
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
        skippedCount++;
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
            results.push({
              id: item.id,
              name: item.name,
              result: result
            });
          } else {
            failedCount++;
            results.push({
              id: item.id,
              name: item.name,
              result: "Failed to update column"
            });
          }
        } else {
          skippedCount++;
          results.push({
            id: item.id,
            name: item.name,
            result: result
          });
        }
      }
      
      // Update progress toast every 5 items
      if (i % 5 === 0 || i === items.length - 1) {
        toast.loading(`Processed ${i + 1} of ${items.length} items...`, { id: "process-board-items" });
      }
      
    } catch (error) {
      failedCount++;
      console.error(`Error processing item ${item.name}:`, error);
      results.push({
        id: item.id,
        name: item.name,
        result: error instanceof Error ? error.message : "Error"
      });
    }
  }
  
  // Dismiss the processing toast
  toast.dismiss("process-board-items");
  
  // Generate summary message for all items
  generateSummaryMessage(items.length, successCount, failedCount, skippedCount, results);
};
