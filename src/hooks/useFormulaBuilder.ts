
import { useState } from 'react';
import { CalculationToken } from '@/types/calculation';
import { BoardColumn } from '@/lib/types';

/**
 * Hook for building and manipulating calculation formulas
 */
export const useFormulaBuilder = () => {
  const [formula, setFormula] = useState<CalculationToken[]>([]);

  const handleAddOperator = (operator: string) => {
    const operatorMap: Record<string, string> = {
      "+": "plus",
      "-": "minus",
      "*": "multiply",
      "/": "divide",
      "(": "open parenthesis",
      ")": "close parenthesis"
    };
    
    setFormula([...formula, {
      id: `op-${Date.now()}`,
      type: "operator" as const,
      value: operator,
      display: operator
    }]);
  };

  const handleAddNumber = () => {
    // Simple implementation - in a real app, would use a dialog
    const number = prompt("Enter a number:");
    if (number && !isNaN(Number(number))) {
      setFormula([...formula, {
        id: `num-${Date.now()}`,
        type: "number" as const,
        value: number,
        display: number
      }]);
    }
  };

  const handleAddColumn = (column: BoardColumn) => {
    setFormula([...formula, {
      id: column.id,
      type: "column" as const,
      value: column.id,
      display: column.title
    }]);
  };

  const handleRemoveToken = (index: number) => {
    const newFormula = [...formula];
    newFormula.splice(index, 1);
    setFormula(newFormula);
  };

  const isFormulaValid = () => {
    return formula.length > 0;
  };
  
  return {
    formula,
    setFormula,
    handleAddOperator,
    handleAddNumber,
    handleAddColumn,
    handleRemoveToken,
    isFormulaValid
  };
};
