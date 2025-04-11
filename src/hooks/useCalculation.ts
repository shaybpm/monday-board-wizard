
import { useState, useEffect } from 'react';
import { CalculationToken } from '@/types/calculation';
import { BoardColumn } from '@/lib/types';
import { Task } from '@/types/task';
import { toast } from 'sonner';

export const useCalculation = (currentTask: Task | null) => {
  const [formula, setFormula] = useState<CalculationToken[]>([]);
  const [targetColumn, setTargetColumn] = useState<BoardColumn | null>(null);
  const [previewResult, setPreviewResult] = useState<string | null>(null);

  // Load saved formula if it exists
  useEffect(() => {
    if (currentTask?.savedOperations?.formula) {
      setFormula(currentTask.savedOperations.formula);
    }
    
    if (currentTask?.savedOperations?.targetColumn) {
      setTargetColumn(currentTask.savedOperations.targetColumn);
    }
  }, [currentTask]);

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
      type: "operator",
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
        type: "number",
        value: number,
        display: number
      }]);
    }
  };

  const handleAddColumn = (column: BoardColumn) => {
    setFormula([...formula, {
      id: column.id,
      type: "column",
      value: column.id,
      display: column.title
    }]);
  };

  const handleSetTarget = (column: BoardColumn) => {
    setTargetColumn(column);
    calculatePreview();
  };

  const calculatePreview = () => {
    // Placeholder for real calculation
    setPreviewResult("42");
  };

  const handleRemoveToken = (index: number) => {
    const newFormula = [...formula];
    newFormula.splice(index, 1);
    setFormula(newFormula);
  };

  const isFormulaValid = () => {
    return formula.length > 0 && targetColumn !== null;
  };

  return {
    formula,
    targetColumn,
    previewResult,
    handleAddOperator,
    handleAddNumber,
    handleAddColumn,
    handleSetTarget,
    handleRemoveToken,
    isFormulaValid
  };
};
