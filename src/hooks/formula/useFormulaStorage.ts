
import { useState, useEffect } from 'react';
import { CalculationToken } from '@/types/calculation';

/**
 * Hook to manage formula storage for different modes
 */
export const useFormulaStorage = (
  formula: CalculationToken[], 
  onFormulaUpdate: (newFormula: CalculationToken[]) => void,
  isLogicTestMode: boolean
) => {
  // Store separate formulas for each mode
  const [calculationFormula, setCalculationFormula] = useState<CalculationToken[]>([]);
  const [logicTestFormula, setLogicTestFormula] = useState<CalculationToken[]>([]);
  
  // Initialize the appropriate formula arrays when component mounts or mode changes
  useEffect(() => {
    if (formula.length > 0) {
      if (isLogicTestMode) {
        // Store in logic test formula state
        setLogicTestFormula(formula);
      } else {
        // Store in calculation formula state
        setCalculationFormula(formula);
      }
    }
    
    // Log for debugging
    console.log("[useFormulaStorage] Is logic test mode:", isLogicTestMode);
    console.log("[useFormulaStorage] Formula:", formula);
  }, [formula, isLogicTestMode]);
  
  // When component first loads, load any saved formulas based on mode
  useEffect(() => {
    if (isLogicTestMode) {
      if (logicTestFormula.length > 0) {
        onFormulaUpdate(logicTestFormula);
      } else if (formula.some(token => token.type === "logical" && ["if", "then", "else"].includes(token.value))) {
        // If formula has logical tokens, store it in logic test formula
        setLogicTestFormula(formula);
      }
    } else {
      if (calculationFormula.length > 0) {
        onFormulaUpdate(calculationFormula);
      } else if (!formula.some(token => token.type === "logical" && ["if", "then", "else"].includes(token.value))) {
        // If formula doesn't have logical tokens, store it in calculation formula
        setCalculationFormula(formula);
      }
    }
  }, [isLogicTestMode]);

  return {
    calculationFormula,
    logicTestFormula
  };
};
