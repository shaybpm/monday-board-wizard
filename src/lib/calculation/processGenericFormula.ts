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
  setProcessedItems: (count: number) => void,
  shouldCancel?: () => boolean
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
  const results: {id: string, name: string, result: number | string | boolean}[] = [];
  
  // Show a processing toast
  toast.loading(`Processing ${items.length} items...`, { id: "process-board-items" });
  
  // Process all items instead of just the first one
  for (let i = 0; i < items.length; i++) {
    // Check if processing should be cancelled
    if (shouldCancel && shouldCancel()) {
      toast.info("Processing cancelled", { 
        id: "process-board-items",
        description: `Processed ${i} of ${items.length} items before cancellation`
      });
      
      // Generate partial results summary
      if (i > 0) {
        generateSummaryMessage(i, successCount, failedCount, skippedCount, results);
      }
      
      return;
    }
    
    const item = items[i];
    setProcessedItems(i + 1);
    
    try {
      // Check if the item has all required columns for formula
      let isValid = true;
      let invalidReason = "";
      
      // Find all column tokens in the formula
      const columnTokens = formula.filter(token => token.type === "column");
      
      // Validate that all required column tokens exist in the item
      for (const token of columnTokens) {
        const columnExists = item.columns[token.id];
        if (!columnExists) {
          isValid = false;
          invalidReason = `Missing column: ${token.display}`;
          break;
        }
        
        // Only validate as number if not used in a logical expression
        const isInLogicalContext = isColumnInLogicalContext(token, formula);
        
        if (!isInLogicalContext) {
          // Check if column value can be parsed as a number
          const textValue = columnExists.text || "";
          const numValue = parseFloat(textValue);
          if (isNaN(numValue)) {
            isValid = false;
            invalidReason = `Column "${token.display}" value "${textValue}" is not a number`;
            break;
          }
        }
      }
      
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
        let valueToUpdate: string;
        
        if (typeof result === "boolean") {
          // Convert boolean to string
          valueToUpdate = result ? "true" : "false";
        } else if (typeof result === "number") {
          valueToUpdate = result.toString();
        } else {
          valueToUpdate = result as string;
        }
        
        const updateSuccess = await updateColumnValue(
          item.id,
          boardId,
          targetColumn.id, 
          valueToUpdate,
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

/**
 * Helper function to determine if a column token is used in a logical context
 * where string values might be acceptable
 */
const isColumnInLogicalContext = (columnToken: CalculationToken, formula: CalculationToken[]): boolean => {
  // Check if formula contains logical operators
  const hasLogical = formula.some(token => token.type === "logical");
  if (!hasLogical) return false;
  
  const columnIndex = formula.findIndex(token => token.id === columnToken.id);
  if (columnIndex === -1) return false;
  
  // Check if column is near a condition token (==, !=)
  const nearbyTokens = formula.slice(Math.max(0, columnIndex - 2), columnIndex + 3);
  return nearbyTokens.some(token => token.type === "condition" && ["==", "!="].includes(token.value));
};
