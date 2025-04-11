
import { useState, useEffect } from 'react';
import { CalculationToken, CalculationFormState } from '@/types/calculation';
import { BoardColumn } from '@/lib/types';
import { Task } from '@/types/task';
import { toast } from 'sonner';

export const useCalculation = (currentTask: Task | null) => {
  const [formula, setFormula] = useState<CalculationToken[]>([]);
  const [targetColumn, setTargetColumn] = useState<BoardColumn | null>(null);
  const [previewResult, setPreviewResult] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Load saved formula if it exists
  useEffect(() => {
    if (currentTask?.savedOperations?.formula) {
      // Ensure the type is correctly cast to the expected type
      const typedFormula = currentTask.savedOperations.formula.map(token => ({
        ...token,
        type: token.type as "column" | "operator" | "number"
      }));
      setFormula(typedFormula);
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

  // New function to test the calculation with sample data
  const testCalculation = () => {
    setIsCalculating(true);
    
    try {
      // In a real implementation, this would use actual data from the Monday.com board
      // For now, we'll simulate a calculation with test data
      
      // Generate sample values for columns in the formula
      const sampleValues: Record<string, number> = {};
      const columnTokens = formula.filter(token => token.type === "column");
      
      // Assign random values to each column used in the formula
      columnTokens.forEach(token => {
        sampleValues[token.id] = Math.floor(Math.random() * 100);
      });
      
      // Create a human-readable representation of the calculation with sample values
      let calculation = "Test calculation using sample data:\n";
      let evaluationString = "";
      
      formula.forEach(token => {
        if (token.type === "column") {
          const value = sampleValues[token.id];
          calculation += `${token.display} = ${value}\n`;
          evaluationString += value;
        } else if (token.type === "number") {
          evaluationString += token.value;
        } else if (token.type === "operator") {
          evaluationString += token.value;
        }
      });
      
      // This is a simplified evaluation for demo purposes
      // In a real implementation, we'd need a proper formula parser/evaluator
      let result: number;
      try {
        // Using Function constructor to evaluate the string as a mathematical expression
        // Note: This is for demonstration only. In production, use a proper formula parser
        result = new Function(`return ${evaluationString}`)();
        
        if (isNaN(result)) {
          throw new Error("Calculation resulted in NaN");
        }
        
        calculation += `\nResult = ${result}`;
        setPreviewResult(result.toString());
        toast.success("Test successful!", {
          description: calculation,
          duration: 5000
        });
      } catch (error) {
        toast.error("Calculation error", {
          description: "The formula couldn't be evaluated. Please check for syntax errors."
        });
      }
    } catch (error) {
      toast.error("Test failed", {
        description: "An error occurred while testing the calculation."
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    formula,
    targetColumn,
    previewResult,
    isCalculating,
    handleAddOperator,
    handleAddNumber,
    handleAddColumn,
    handleSetTarget,
    handleRemoveToken,
    isFormulaValid,
    testCalculation
  };
};
