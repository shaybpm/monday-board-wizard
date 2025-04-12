
import { useState } from 'react';
import { testCalculationFormula, processBoardData } from '@/lib/calculationUtils';
import { CalculationToken } from '@/types/calculation';
import { BoardColumn } from '@/lib/types';
import { toast } from 'sonner';

/**
 * Hook for managing calculation processing state
 */
export const useCalculationProcess = () => {
  const [previewResult, setPreviewResult] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [processedItems, setProcessedItems] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  const testCalculation = async (formula: CalculationToken[]) => {
    setIsCalculating(true);
    setPreviewResult(null);
    
    try {
      // Display a pending toast
      toast.loading("Fetching data from Monday.com...", { id: "test-calculation" });
      
      console.log("Testing calculation with formula:", formula);
      const result = await testCalculationFormula(formula);
      
      if (result) {
        setPreviewResult(result.toString());
        // Toast will be handled in the testCalculationFormula function
      } else {
        toast.error("Couldn't complete the calculation", { 
          id: "test-calculation",
          description: "Failed to retrieve or calculate values. Check console for details."
        });
      }
    } catch (error) {
      console.error("Error testing calculation:", error);
      toast.error("Error testing calculation", { 
        id: "test-calculation",
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsCalculating(false);
    }
  };
  
  const processBoard = async (
    boardData: any, 
    formula: CalculationToken[], 
    targetColumn: BoardColumn | null
  ) => {
    if (!targetColumn) {
      toast.error("No target column selected", {
        description: "Please select a target column for the calculation results."
      });
      return;
    }
    
    setIsCalculating(true);
    setProcessedItems(0);
    setDebugInfo(null);
    
    try {
      // Get credentials from session storage
      const credsStr = sessionStorage.getItem("mondayCredentials");
      if (!credsStr) {
        toast.error("No Monday.com credentials found");
        setIsCalculating(false);
        return;
      }
      
      const credentials = JSON.parse(credsStr);
      const boardId = credentials.sourceBoard || "1909452712";
      
      // Show a loading toast
      toast.loading("Starting debug process...", { id: "process-board" });
      
      console.log("DEBUG MODE: Processing only the first item");
      
      // Using the same query as in testCalculationFormula to ensure consistency
      const query = `
        query {
          boards(ids: ${boardId}) {
            items_page(limit: 1) {
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
      
      // Import and use fetchFromMonday directly
      const { fetchFromMonday } = await import('@/lib/api/mondayApiClient');
      const response = await fetchFromMonday(query, credentials.apiToken);
      
      if (!response?.data?.boards?.[0]?.items_page?.items?.[0]) {
        toast.error("No items found in the board", { 
          id: "process-board",
          description: "Board ID: " + boardId
        });
        setIsCalculating(false);
        return;
      }
      
      const firstItem = response.data.boards[0].items_page.items[0];
      console.log("Processing first item:", firstItem);
      
      // For debug mode, we'll focus on Hebrew columns calculation
      const accountColumnId = "numeric_mkpv862j"; // סכום בחשבון
      const receiptColumnId = "numeric_mkpv3cnz"; // סכום בתקבול
      
      // Find the values
      const accountColumn = firstItem.column_values.find(
        (col: any) => col.id === accountColumnId
      );
      
      const receiptColumn = firstItem.column_values.find(
        (col: any) => col.id === receiptColumnId
      );
      
      if (!accountColumn || !receiptColumn) {
        const missingColumns = [];
        if (!accountColumn) missingColumns.push("סכום בחשבון (numeric_mkpv862j)");
        if (!receiptColumn) missingColumns.push("סכום בתקבול (numeric_mkpv3cnz)");
        
        toast.error(`Could not find required columns`, {
          id: "process-board",
          description: `Missing: ${missingColumns.join(", ")}`
        });
        setIsCalculating(false);
        return;
      }
      
      // Parse the values and calculate difference
      const accountValue = parseFloat(accountColumn.text || "0");
      const receiptValue = parseFloat(receiptColumn.text || "0");
      
      if (isNaN(accountValue) || isNaN(receiptValue)) {
        toast.error("Column values are not valid numbers", {
          id: "process-board",
          description: `Account: ${accountColumn.text}, Receipt: ${receiptColumn.text}`
        });
        setIsCalculating(false);
        return;
      }
      
      const difference = accountValue - receiptValue;
      
      // Create detailed debug info
      let debugMessage = `Debug for item "${firstItem.name}" (ID: ${firstItem.id}):\n\n`;
      debugMessage += `סכום בחשבון (${accountColumnId}): ${accountValue}\n`;
      debugMessage += `סכום בתקבול (${receiptColumnId}): ${receiptValue}\n`;
      debugMessage += `\nCalculation: ${accountValue} - ${receiptValue} = ${difference}\n`;
      debugMessage += `\nTarget column: ${targetColumn.title} (${targetColumn.id})`;
      
      console.log(debugMessage);
      setDebugInfo(debugMessage);
      
      // Update processed count for UI
      setProcessedItems(1);
      setTotalItems(1);
      
      // Show success message with detailed information
      toast.success("Debug processing complete", {
        id: "process-board",
        description: debugMessage,
        duration: 20000
      });
      
    } catch (error) {
      console.error("Error in debug processing:", error);
      toast.error("Debug processing error", {
        id: "process-board", 
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsCalculating(false);
    }
  };
  
  return {
    previewResult,
    isCalculating,
    processedItems,
    totalItems,
    debugInfo,
    setPreviewResult,
    testCalculation,
    processBoard
  };
};
