
import { BoardItem } from "@/lib/types";
import { CalculationToken } from "@/types/calculation";

/**
 * Evaluates a formula for a specific board item
 */
export const evaluateFormulaForItem = (formula: CalculationToken[], item: BoardItem): number | string | boolean => {
  // Check if the formula contains logical operations
  const hasLogicalOperations = formula.some(token => token.type === 'logical' && ['if', 'then', 'else'].includes(token.value));

  if (hasLogicalOperations) {
    return evaluateConditionalFormula(formula, item);
  } else {
    return evaluateMathFormula(formula, item);
  }
};

/**
 * Evaluates a mathematical formula
 */
const evaluateMathFormula = (formula: CalculationToken[], item: BoardItem): number | string => {
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

/**
 * Evaluates a conditional formula with if-then-else logic
 */
const evaluateConditionalFormula = (formula: CalculationToken[], item: BoardItem): number | string | boolean => {
  try {
    // Find indexes of if, then, else tokens
    const ifIndex = formula.findIndex(token => token.type === 'logical' && token.value === 'if');
    const thenIndex = formula.findIndex(token => token.type === 'logical' && token.value === 'then');
    const elseIndex = formula.findIndex(token => token.type === 'logical' && token.value === 'else');
    
    // Check if we have the minimum required tokens for a conditional formula
    if (ifIndex === -1) {
      throw new Error("Invalid conditional formula: missing IF");
    }
    
    // Extract the condition part (between if and then, or until the end if no then)
    const conditionTokens = thenIndex !== -1 
      ? formula.slice(ifIndex + 1, thenIndex) 
      : formula.slice(ifIndex + 1);
    
    // If we don't have a THEN token, the entire formula is just a condition
    if (thenIndex === -1) {
      // Just evaluate the condition
      return evaluateCondition(conditionTokens, item);
    }
    
    // Extract the "then" result part (between then and else, or until the end if no else)
    const thenTokens = elseIndex !== -1 
      ? formula.slice(thenIndex + 1, elseIndex) 
      : formula.slice(thenIndex + 1);
    
    // Extract the "else" result part if it exists
    const elseTokens = elseIndex !== -1 
      ? formula.slice(elseIndex + 1) 
      : [];
    
    // Evaluate the condition
    const conditionResult = evaluateCondition(conditionTokens, item);
    
    // Based on condition result, evaluate the appropriate branch
    if (conditionResult === true) {
      // THEN branch
      if (thenTokens.length === 1 && thenTokens[0].type === 'logical') {
        return thenTokens[0].value === 'true';
      } else if (thenTokens.length === 0) {
        // If no "then" action specified, return true
        return true;
      } else {
        return evaluateMathFormula(thenTokens, item);
      }
    } else {
      // ELSE branch
      if (elseTokens.length === 0) {
        // If no "else" clause specified, return original column value if possible
        if (conditionTokens.length > 0 && conditionTokens[0].type === "column") {
          const columnId = conditionTokens[0].id;
          const columnValue = item.columns[columnId];
          if (columnValue && columnValue.text) {
            const numValue = parseFloat(columnValue.text);
            if (!isNaN(numValue)) {
              return numValue;
            }
            return columnValue.text;
          }
        }
        return false;
      } else if (elseTokens.length === 1 && elseTokens[0].type === 'logical') {
        return elseTokens[0].value === 'true';
      } else {
        return evaluateMathFormula(elseTokens, item);
      }
    }
  } catch (error) {
    console.error(`Error evaluating conditional formula for item ${item.name}:`, error);
    return error instanceof Error ? error.message : "Error in conditional";
  }
};

/**
 * Evaluates a condition expression (left op right)
 */
const evaluateCondition = (conditionTokens: CalculationToken[], item: BoardItem): boolean => {
  // We need at least 3 tokens: left operand, comparison operator, right operand
  if (conditionTokens.length < 3) {
    throw new Error("Invalid condition: needs at least a left value, operator, and right value");
  }
  
  // Find the position of the conditional operator
  const conditionOpIndex = conditionTokens.findIndex(token => token.type === 'condition');
  if (conditionOpIndex === -1) {
    throw new Error("Invalid condition: missing comparison operator");
  }
  
  // Extract left and right parts of the condition
  const leftTokens = conditionTokens.slice(0, conditionOpIndex);
  const rightTokens = conditionTokens.slice(conditionOpIndex + 1);
  
  // Get the conditional operator
  const operator = conditionTokens[conditionOpIndex].value;
  
  // Evaluate left and right sides
  const leftValue = leftTokens.length === 1 && leftTokens[0].type === 'logical' ?
    leftTokens[0].value === 'true' :
    evaluateMathFormula(leftTokens, item);
    
  const rightValue = rightTokens.length === 1 && rightTokens[0].type === 'logical' ?
    rightTokens[0].value === 'true' :
    evaluateMathFormula(rightTokens, item);
  
  // Perform the comparison
  switch (operator) {
    case '==': return leftValue == rightValue;
    case '!=': return leftValue != rightValue;
    case '<': return Number(leftValue) < Number(rightValue);
    case '>': return Number(leftValue) > Number(rightValue);
    case '<=': return Number(leftValue) <= Number(rightValue);
    case '>=': return Number(leftValue) >= Number(rightValue);
    default: throw new Error(`Unknown comparison operator: ${operator}`);
  }
};

export { evaluateMathFormula, evaluateConditionalFormula };
