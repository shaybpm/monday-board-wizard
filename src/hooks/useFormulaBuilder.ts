
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

  const handleAddCondition = (condition: string) => {
    const conditionMap: Record<string, string> = {
      "==": "equals",
      "!=": "not equals",
      "<": "less than",
      ">": "greater than",
      "<=": "less than or equal",
      ">=": "greater than or equal"
    };
    
    setFormula([...formula, {
      id: `cond-${Date.now()}`,
      type: "condition" as const,
      value: condition,
      display: condition
    }]);
  };

  const handleAddLogical = (logical: string) => {
    const logicalDisplay = logical.toUpperCase();
    
    setFormula([...formula, {
      id: `log-${Date.now()}`,
      type: "logical" as const,
      value: logical.toLowerCase(),
      display: logicalDisplay
    }]);
  };

  const handleAddNumber = () => {
    // Simple implementation - in a real app, would use a dialog
    const number = prompt("Enter a number:");
    if (number && !isNaN(Number(number))) {
      setFormula([...formula, {
        id: `num-${Date.now()}`,
        type: "number" as const, // Ensure this is "number" not "column"
        value: number,
        display: number
      }]);
    }
  };

  const handleAddColumn = (column: BoardColumn | any) => {
    // Check if this is actually a number token coming from the number input hook
    if (column.type === "number" || column.isNumberToken) {
      setFormula([...formula, {
        id: column.id || `num-${Date.now()}`,
        type: "number" as const,
        value: column.value || column.title,
        display: column.title
      }]);
    } else {
      // Regular column
      setFormula([...formula, {
        id: column.id,
        type: "column" as const,
        value: column.id,
        display: column.title
      }]);
    }
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
    handleAddCondition,
    handleAddLogical,
    handleAddNumber,
    handleAddColumn,
    handleRemoveToken,
    isFormulaValid
  };
};
