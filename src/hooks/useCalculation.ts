
import { useEffect, useState } from 'react';
import { Task } from '@/types/task';
import { useFormulaBuilder } from './useFormulaBuilder';
import { useTargetColumn } from './useTargetColumn';
import { useCalculationProcess } from './useCalculationProcess';

/**
 * Main hook for calculation functionality
 */
export const useCalculation = (currentTask: Task | null) => {
  // Track if the saved formula has been loaded
  const [savedFormulaLoaded, setSavedFormulaLoaded] = useState(false);

  // Use our custom hooks
  const formulaBuilder = useFormulaBuilder();
  const targetColumnState = useTargetColumn();
  const calculationProcess = useCalculationProcess();
  
  // Load saved formula if it exists
  useEffect(() => {
    if (currentTask?.savedOperations?.formula && !savedFormulaLoaded) {
      console.log("Loading saved formula:", currentTask.savedOperations.formula);
      
      // Ensure the type is correctly cast to the expected type
      const typedFormula = currentTask.savedOperations.formula.map(token => ({
        ...token,
        type: token.type as "column" | "operator" | "number" | "condition" | "logical"
      }));
      formulaBuilder.setFormula(typedFormula);
      
      if (currentTask.savedOperations.targetColumn) {
        targetColumnState.setTargetColumn(currentTask.savedOperations.targetColumn);
      }

      // Mark as loaded to prevent re-loading
      setSavedFormulaLoaded(true);
    }
  }, [currentTask, savedFormulaLoaded]);

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
    // Store debug info in session storage for easy access in UI components
    if (calculationProcess.debugInfo) {
      sessionStorage.setItem("calculationDebugInfo", calculationProcess.debugInfo);
    }
    
    // Make sure we pass the correct formula and target column
    calculationProcess.processBoard(
      boardData, 
      formulaBuilder.formula, 
      targetColumnState.targetColumn
    );
  };

  // Add a number token properly
  const handleAddNumber = () => {
    // This ensures the number token is created with the proper type
    formulaBuilder.handleAddNumber();
  };

  // Cancel the processing
  const cancelProcessing = () => {
    calculationProcess.cancelProcess();
  };

  return {
    // Formula state
    formula: formulaBuilder.formula,
    setFormula: formulaBuilder.setFormula,
    handleAddOperator: formulaBuilder.handleAddOperator,
    handleAddNumber, // Use our wrapped function
    handleAddColumn: formulaBuilder.handleAddColumn,
    handleRemoveToken: formulaBuilder.handleRemoveToken,
    handleAddCondition: formulaBuilder.handleAddCondition,
    handleAddLogical: formulaBuilder.handleAddLogical,
    
    // Target column state
    targetColumn: targetColumnState.targetColumn,
    handleSetTarget: targetColumnState.handleSetTarget,
    
    // Processing state
    previewResult: calculationProcess.previewResult,
    isCalculating: calculationProcess.isCalculating,
    processedItems: calculationProcess.processedItems,
    totalItems: calculationProcess.totalItems,
    debugInfo: calculationProcess.debugInfo,
    
    // Utility methods
    isFormulaValid,
    testCalculation,
    processBoardData,
    cancelProcessing
  };
};
