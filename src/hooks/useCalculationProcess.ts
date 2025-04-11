
import { useState } from 'react';
import { testCalculationFormula, processBoardData } from '@/lib/calculationUtils';
import { CalculationToken } from '@/types/calculation';
import { BoardColumn } from '@/lib/types';

/**
 * Hook for managing calculation processing state
 */
export const useCalculationProcess = () => {
  const [previewResult, setPreviewResult] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [processedItems, setProcessedItems] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  const testCalculation = (formula: CalculationToken[]) => {
    setIsCalculating(true);
    const result = testCalculationFormula(formula);
    setPreviewResult(result);
    setIsCalculating(false);
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
