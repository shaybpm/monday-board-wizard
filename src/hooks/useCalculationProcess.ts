
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
  
  const testCalculation = async (formula: CalculationToken[]) => {
    setIsCalculating(true);
    setPreviewResult(null);
    
    try {
      // Display a pending toast
      toast.loading("Fetching data from Monday.com...", { id: "test-calculation" });
      
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
  
  const processBoard = (
    boardData: any, 
    formula: CalculationToken[], 
    targetColumn: BoardColumn | null
  ) => {
    if (!targetColumn) return;
    
    processBoardData(
      boardData,
      formula,
      targetColumn,
      setIsCalculating,
      setProcessedItems,
      setTotalItems
    );
  };
  
  return {
    previewResult,
    isCalculating,
    processedItems,
    totalItems,
    setPreviewResult,
    testCalculation,
    processBoard
  };
};
