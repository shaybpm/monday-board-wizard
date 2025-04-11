
import { useState, useEffect } from 'react';
import { CalculationToken, CalculationFormState } from '@/types/calculation';
import { BoardColumn, BoardItem } from '@/lib/types';
import { Task } from '@/types/task';
import { toast } from 'sonner';

export const useCalculation = (currentTask: Task | null) => {
  const [formula, setFormula] = useState<CalculationToken[]>([]);
  const [targetColumn, setTargetColumn] = useState<BoardColumn | null>(null);
  const [previewResult, setPreviewResult] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [processedItems, setProcessedItems] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

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

  // Evaluate a formula for a specific item
  const evaluateFormulaForItem = (item: BoardItem): number | string => {
    let evaluationString = "";
    
    try {
      formula.forEach(token => {
        if (token.type === "column") {
          const columnValue = item.columns[token.id];
          if (!columnValue || !columnValue.text) {
            throw new Error(`Column ${token.display} has no value for item ${item.name}`);
          }
          
          // Try to convert column value to number
          const numValue = parseFloat(columnValue.text);
          if (isNaN(numValue)) {
            throw new Error(`Column ${token.display} value "${columnValue.text}" is not a number`);
          }
          evaluationString += numValue;
        } else if (token.type === "number") {
          evaluationString += token.value;
        } else if (token.type === "operator") {
          evaluationString += token.value;
        }
      });
      
      // Evaluate the formula
      const result = new Function(`return ${evaluationString}`)();
      
      if (isNaN(result)) {
        return "NaN";
      }
      
      return result;
    } catch (error) {
      console.error(`Error evaluating formula for item ${item.name}:`, error);
      return error instanceof Error ? error.message : "Error";
    }
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

  // New function to process the entire board data
  const processBoardData = (boardData: any) => {
    setIsCalculating(true);
    setProcessedItems(0);
    
    try {
      if (!boardData || !boardData.items || !targetColumn) {
        toast.error("Missing data", {
          description: "Board data or target column is missing."
        });
        setIsCalculating(false);
        return;
      }

      const items = boardData.items;
      setTotalItems(items.length);
      
      // Count items that can be processed (have all required columns)
      const validItems: BoardItem[] = [];
      const invalidItems: {item: BoardItem, reason: string}[] = [];
      
      // First pass: validate all items
      items.forEach((item: BoardItem) => {
        let isValid = true;
        let invalidReason = "";
        
        // Check if the item has all required columns from the formula
        formula.forEach(token => {
          if (token.type === "column") {
            const columnExists = item.columns[token.id];
            if (!columnExists) {
              isValid = false;
              invalidReason = `Missing column: ${token.display}`;
              return;
            }
            
            // Check if column value can be parsed as a number
            const textValue = columnExists.text || "";
            const numValue = parseFloat(textValue);
            if (isNaN(numValue)) {
              isValid = false;
              invalidReason = `Column "${token.display}" value "${textValue}" is not a number`;
              return;
            }
          }
        });
        
        // Also check if target column exists in the item
        if (!item.columns[targetColumn.id]) {
          isValid = false;
          invalidReason = `Target column "${targetColumn.title}" does not exist in this item`;
        }
        
        if (isValid) {
          validItems.push(item);
        } else {
          invalidItems.push({item, reason: invalidReason});
        }
      });
      
      // Log validation results
      console.log(`Valid items: ${validItems.length}, Invalid items: ${invalidItems.length}`);
      
      // Second pass: process valid items
      const results: {id: string, name: string, result: number | string}[] = [];
      let successCount = 0;
      
      validItems.forEach((item, index) => {
        try {
          const result = evaluateFormulaForItem(item);
          results.push({
            id: item.id,
            name: item.name,
            result: result
          });
          
          if (typeof result === "number") {
            successCount++;
          }
          
          // Update progress
          setProcessedItems(index + 1);
        } catch (error) {
          console.error(`Error processing item ${item.name}:`, error);
          results.push({
            id: item.id,
            name: item.name,
            result: error instanceof Error ? error.message : "Error"
          });
        }
      });
      
      // Generate the summary message
      let summaryMessage = `Processed ${validItems.length} items:\n`;
      summaryMessage += `✅ ${successCount} calculations successful\n`;
      summaryMessage += `❌ ${validItems.length - successCount} calculations failed\n`;
      
      if (invalidItems.length > 0) {
        summaryMessage += `⚠️ ${invalidItems.length} items skipped (missing or invalid data)\n`;
      }
      
      // Show some example results
      const exampleCount = Math.min(5, results.length);
      if (exampleCount > 0) {
        summaryMessage += "\nExample results:\n";
        for (let i = 0; i < exampleCount; i++) {
          const result = results[i];
          summaryMessage += `- ${result.name}: ${result.result}\n`;
        }
      }
      
      // Show the results
      toast.success("Board processing complete", {
        description: summaryMessage,
        duration: 10000
      });
      
    } catch (error) {
      toast.error("Processing error", {
        description: error instanceof Error ? error.message : "An error occurred while processing board data."
      });
    } finally {
      setIsCalculating(false);
      setProcessedItems(0);
      setTotalItems(0);
    }
  };

  return {
    formula,
    targetColumn,
    previewResult,
    isCalculating,
    processedItems,
    totalItems,
    handleAddOperator,
    handleAddNumber,
    handleAddColumn,
    handleSetTarget,
    handleRemoveToken,
    isFormulaValid,
    testCalculation,
    processBoardData
  };
};
