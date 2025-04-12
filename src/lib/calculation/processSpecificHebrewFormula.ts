
import { BoardItem } from "@/lib/types";
import { toast } from "sonner";
import { updateColumnValue } from "./updateColumnApi";
import { generateSummaryMessage } from "./resultSummary";

/**
 * Process items with the Hebrew columns specific formula
 */
export const processSpecificHebrewFormula = async (
  items: BoardItem[],
  setProcessedItems: (count: number) => void,
  shouldCancel?: () => boolean
) => {
  let validItems = 0;
  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  const results: {id: string, name: string, result: number | string}[] = [];
  
  // Get the credentials for API updates
  const credsStr = sessionStorage.getItem("mondayCredentials");
  if (!credsStr) {
    toast.error("No Monday.com credentials found");
    return;
  }
  
  const credentials = JSON.parse(credsStr);
  const boardId = credentials.sourceBoard;
  const targetColumnId = "numeric_mkpvgf7j"; // ח. פנימי column
  
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
      const accountValue = parseFloat(item.columns["numeric_mkpv862j"]?.text || "0");
      const receiptValue = parseFloat(item.columns["numeric_mkpv3cnz"]?.text || "0");
      
      if (isNaN(accountValue) || isNaN(receiptValue)) {
        skippedCount++;
        results.push({
          id: item.id,
          name: item.name,
          result: "Invalid number values"
        });
      } else {
        validItems++;
        const difference = accountValue - receiptValue;
        
        // Update the target column with the difference
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
  
  // Generate the summary message
  generateSummaryMessage(items.length, successCount, failedCount, skippedCount, results);
};
