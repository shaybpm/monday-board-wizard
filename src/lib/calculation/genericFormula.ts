
import { CalculationToken } from "@/types/calculation";
import { BoardItem } from "@/lib/types";
import { toast } from "sonner";
import { evaluateFormulaForItem } from "./formulaEvaluation";

/**
 * Handles evaluation of user-defined formula
 */
export const handleGenericFormula = (formula: CalculationToken[], firstItem: any) => {
  // Convert the first item to our internal format
  const formattedItem: BoardItem = {
    id: firstItem.id,
    name: firstItem.name,
    groupId: "",
    groupTitle: "",
    type: 'item',
    columns: {}
  };
  
  // Log the formula for debugging
  console.log("Processing formula tokens:", formula);
  
  // Verify if this is a logical formula (IF without THEN) or a regular formula
  const hasIf = formula.some(token => token.type === 'logical' && token.value === 'if');
  const hasThen = formula.some(token => token.type === 'logical' && token.value === 'then');
  
  // If we have an IF without a THEN, add a message to explain
  if (hasIf && !hasThen) {
    console.log("Formula contains IF without THEN - will evaluate as condition only");
  }
  
  // Add all columns to our formatted item
  firstItem.column_values.forEach((col: any) => {
    formattedItem.columns[col.id] = {
      id: col.id,
      title: col.id, // Using column ID as title since title is not available
      type: col.type,
      value: col.value,
      text: col.text
    };
  });
  
  // Check if the first item has all required columns, but ONLY check for actual columns
  const missingColumns: string[] = [];
  formula.forEach(token => {
    // Only validate column tokens, not number or other tokens
    if (token.type === "column") {
      if (!formattedItem.columns[token.id] || !formattedItem.columns[token.id].text) {
        missingColumns.push(token.display);
      }
    }
  });
  
  if (missingColumns.length > 0) {
    toast.error("First item is missing required columns", {
      id: "test-calculation",
      description: `Missing columns: ${missingColumns.join(", ")}`
    });
    return null;
  }
  
  // Validate if number tokens are properly formatted
  const invalidNumbers: string[] = [];
  formula.forEach(token => {
    if (token.type === "number") {
      if (isNaN(parseFloat(token.value))) {
        invalidNumbers.push(`${token.display} (${token.value})`);
      }
    }
  });
  
  if (invalidNumbers.length > 0) {
    toast.error("Formula contains invalid numbers", {
      id: "test-calculation",
      description: `Invalid numbers: ${invalidNumbers.join(", ")}`
    });
    return null;
  }
  
  // Evaluate the formula for the first item
  const result = evaluateFormulaForItem(formula, formattedItem);
  
  // Build the calculation display string with actual values
  let calculation = `Test calculation using first item "${formattedItem.name}":\n`;
  
  // Include actual column values and number literals in the display
  formula.forEach(token => {
    if (token.type === "column") {
      const columnValue = formattedItem.columns[token.id];
      const displayValue = columnValue?.text || "N/A";
      calculation += `${token.display} (${token.id}) = ${displayValue}\n`;
    } else if (token.type === "number") {
      calculation += `Number: ${token.display} = ${token.value}\n`;
    } else if (token.type === "condition") {
      calculation += `Condition: ${token.display}\n`;
    } else if (token.type === "logical") {
      calculation += `Logic: ${token.display}\n`;
    }
  });
  
  calculation += `\nResult = ${result}`;
  
  if (typeof result === "string" && result.startsWith("Error")) {
    toast.error("Calculation error", {
      id: "test-calculation",
      description: result,
      duration: 5000
    });
    return null;
  } else {
    toast.success("Test successful!", {
      id: "test-calculation",
      description: calculation,
      duration: 8000
    });
    
    return result.toString();
  }
};
