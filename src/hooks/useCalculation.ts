
import { useEffect } from 'react';
import { Task } from '@/types/task';
import { useFormulaBuilder } from './useFormulaBuilder';
import { useTargetColumn } from './useTargetColumn';
import { useCalculationProcess } from './useCalculationProcess';

/**
 * Main hook for calculation functionality
 */
export const useCalculation = (currentTask: Task | null) => {
  // Use our custom hooks
  const formulaBuilder = useFormulaBuilder();
  const targetColumnState = useTargetColumn();
  const calculationProcess = useCalculationProcess();
  
  // Load saved formula if it exists
  useEffect(() => {
    if (currentTask?.savedOperations?.formula) {
      // Ensure the type is correctly cast to the expected type
      const typedFormula = currentTask.savedOperations.formula.map(token => ({
        ...token,
        type: token.type as "column" | "operator" | "number"
      }));
      formulaBuilder.setFormula(typedFormula);
    }
    
    if (currentTask?.savedOperations?.targetColumn) {
      targetColumnState.setTargetColumn(currentTask.savedOperations.targetColumn);
    }
  }, [currentTask]);

  // Combined isFormulaValid function
  const isFormulaValid = () => {
    return formulaBuilder.isFormulaValid() && targetColumnState.isTargetValid();
  };

  // Test the calculation
  const testCalculation = () => {
    calculationProcess.testCalculation(formulaBuilder.formula);
  };
  
  // Process the board data
  const processBoardData = (boardData: any) => {
    calculationProcess.processBoard(
      boardData, 
      formulaBuilder.formula, 
      targetColumnState.targetColumn
    );
  };

  return {
    // Formula state
    formula: formulaBuilder.formula,
    handleAddOperator: formulaBuilder.handleAddOperator,
    handleAddNumber: formulaBuilder.handleAddNumber,
    handleAddColumn: formulaBuilder.handleAddColumn,
    handleRemoveToken: formulaBuilder.handleRemoveToken,
    
    // Target column state
    targetColumn: targetColumnState.targetColumn,
    handleSetTarget: targetColumnState.handleSetTarget,
    
    // Processing state
    previewResult: calculationProcess.previewResult,
    isCalculating: calculationProcess.isCalculating,
    processedItems: calculationProcess.processedItems,
    totalItems: calculationProcess.totalItems,
    
    // Utility methods
    isFormulaValid,
    testCalculation,
    processBoardData
  };
};
