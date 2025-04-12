import { useState } from 'react';
import { testCalculationFormula, processBoardData } from '@/lib/calculation';
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
      
      // Show a loading toast
      toast.loading("Processing board items...", { id: "process-board" });
      
      // Call the processBoardData function from the utility
      await processBoardData(
        boardData,
        formula,
        targetColumn,
        setIsCalculating,
        setProcessedItems,
        setTotalItems
      );
      
      // Debug info will be shown by processBoardData function
      
    } catch (error) {
      console.error("Error processing board:", error);
      toast.error("Error processing board", {
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
