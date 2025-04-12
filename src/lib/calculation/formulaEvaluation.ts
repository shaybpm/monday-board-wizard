
import { BoardItem } from "@/lib/types";
import { CalculationToken } from "@/types/calculation";

/**
 * Evaluates a formula for a specific board item
 */
export const evaluateFormulaForItem = (formula: CalculationToken[], item: BoardItem): number | string => {
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
