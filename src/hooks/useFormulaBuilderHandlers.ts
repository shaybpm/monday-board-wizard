import { CalculationToken } from '@/types/calculation';
import { useFormulaTokens } from './formula/useFormulaTokens';

interface FormulaBuilderHandlersProps {
  formula: CalculationToken[];
  isLogicTestMode: boolean;
  activeSection: "condition" | "then" | "else";
  onAddColumn: (column: any) => void;
  onAddOperator: (operator: string) => void;
  onAddNumber: () => void;
  onRemoveToken: (index: number) => void;
  onAddCondition: (condition: string) => void;
  onAddLogical: (logical: string) => void;
}

/**
 * Hook to handle all token-related actions in FormulaBuilder
 */
export const useFormulaBuilderHandlers = ({
  formula,
  isLogicTestMode,
  activeSection,
  onAddColumn,
  onAddOperator,
  onAddNumber,
  onRemoveToken,
  onAddCondition,
  onAddLogical
}: FormulaBuilderHandlersProps) => {
  console.log("useFormulaBuilderHandlers - Is Logic Test Mode:", isLogicTestMode);
  
  // Use our custom hook for token handling with formula update callback
  const {
    handleAddColumnWrapped,
    handleAddDirectInput
  } = useFormulaTokens({
    formula,
    isLogicTestMode,
    activeSection,
    onAddToken: (token) => {
      console.log("[FormulaBuilderHandlers] Received token:", token);
      
      // Handle different token types
      if (token.type === "column") {
        // For column tokens, pass through to onAddColumn
        const column = { id: token.value, title: token.display };
        onAddColumn(column);
      } else if (token.type === "operator") {
        // For operator tokens, pass through to onAddOperator
        onAddOperator(token.value);
      } else if (token.type === "number") {
        // For number tokens, add directly to parent formula
        console.log("[FormulaBuilderHandlers] Adding number token to formula");
        onAddColumn({
          id: token.id,
          title: token.display,
          type: "number",
          value: token.value,
          isNumberToken: true // Add flag to identify number tokens
        });
      } else if (token.type === "condition") {
        // For condition tokens, pass through to onAddCondition
        onAddCondition(token.value);
      } else if (token.type === "logical") {
        // For logical tokens, pass through to onAddLogical
        onAddLogical(token.value);
      }
    },
    onAddLogical
  });

  // Handler for direct text input from formula sections
  const handleDirectInput = (text: string, section: "condition" | "then" | "else") => {
    console.log(`[FormulaBuilderHandlers] Direct input received: "${text}" for section "${section}"`);
    
    // First check if the text matches any of our logical operators
    const lowerText = text.toLowerCase();
    
    // Insert text as logical token if it matches if/then/else
    if (["if", "then", "else"].includes(lowerText)) {
      console.log(`[FormulaBuilderHandlers] Adding logical token from text: ${lowerText}`);
      onAddLogical(lowerText);
      return;
    }
    
    // Check if it's a number
    if (!isNaN(Number(text))) {
      // Add as number token
      console.log(`[FormulaBuilderHandlers] Adding number token from text: ${text}`);
      onAddColumn({
        id: `num-${Date.now()}`,
        title: text,
        type: "number",
        value: text,
        isNumberToken: true
      });
      return;
    }
    
    // Check if it's a condition operator
    const conditionOperators = ["==", "!=", "<", ">", "<=", ">=", "="];
    if (conditionOperators.includes(text)) {
      // Normalize "=" to "=="
      const normalizedOperator = text === "=" ? "==" : text;
      console.log(`[FormulaBuilderHandlers] Adding condition operator from text: ${normalizedOperator}`);
      onAddCondition(normalizedOperator);
      return;
    }
    
    // Check if it's a math operator
    const mathOperators = ["+", "-", "*", "/", "(", ")"];
    if (mathOperators.includes(text)) {
      console.log(`[FormulaBuilderHandlers] Adding math operator from text: ${text}`);
      onAddOperator(text);
      return;
    }
    
    // Otherwise add as a text token (custom type)
    console.log(`[FormulaBuilderHandlers] Adding text token: ${text}`);
    onAddColumn({
      id: `txt-${Date.now()}`,
      title: text,
      type: "text",
      value: text,
      isTextToken: true
    });
  };
  
  return {
    handleAddColumnWrapped,
    handleDirectInput
  };
};
