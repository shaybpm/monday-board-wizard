import React from "react";
import { CalculationToken } from "@/types/calculation";
import FormulaBuilderHeader from "./FormulaBuilderHeader";
import FormulaSections from "./FormulaSections";
import FormulaInstructions from "./FormulaInstructions";
import { useFormulaSections } from "@/hooks/useFormulaSections";
import { useFormulaTokens } from "@/hooks/useFormulaTokens";

interface FormulaBuilderProps {
  formula: CalculationToken[];
  onAddColumn: (column: any) => void;
  onAddOperator: (operator: string) => void;
  onAddNumber: () => void;
  onRemoveToken: (index: number) => void;
  onAddCondition: (condition: string) => void;
  onAddLogical: (logical: string) => void;
  isLogicTestMode: boolean;
}

const FormulaBuilder: React.FC<FormulaBuilderProps> = ({
  formula,
  onAddColumn,
  onAddOperator,
  onAddNumber,
  onRemoveToken,
  onAddCondition,
  onAddLogical,
  isLogicTestMode,
}) => {
  console.log("FormulaBuilder - Is Logic Test Mode:", isLogicTestMode);
  
  // Use our custom hook for section management with formula update callback
  const {
    activeSection,
    handleSectionClick
  } = useFormulaSections(formula, (newFormula) => {
    // This would be called when we need to update the formula after mode switch
    console.log("[FormulaBuilder] Formula update callback triggered with new formula:", newFormula);
    
    // Clear the current formula and add all tokens from newFormula
    if (newFormula.length > 0) {
      // Remove all tokens from current formula
      while (formula.length > 0) {
        onRemoveToken(0);
      }
      
      // Add all tokens from the saved formula for the selected mode
      newFormula.forEach(token => {
        if (token.type === "column") {
          onAddColumn({ id: token.value, title: token.display });
        } else if (token.type === "operator") {
          onAddOperator(token.value);
        } else if (token.type === "number") {
          onAddColumn({
            id: token.id,
            title: token.display,
            type: "number",
            value: token.value,
            isNumberToken: true
          });
        } else if (token.type === "condition") {
          onAddCondition(token.value);
        } else if (token.type === "logical") {
          console.log(`[FormulaBuilder] Adding logical token: ${token.value}`);
          onAddLogical(token.value);
        }
      });
    }
  }, isLogicTestMode);
  
  // Use our refactored hooks system for token handling
  const {
    handleAddColumnWrapped,
    handleAddDirectInput
  } = useFormulaTokens({
    formula,
    isLogicTestMode,
    activeSection,
    onAddToken: (token) => {
      console.log("[FormulaBuilder] Received token:", token);
      
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
        console.log("[FormulaBuilder] Adding number token to formula");
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
    console.log(`[FormulaBuilder] Direct input received: "${text}" for section "${section}"`);
    
    // First check if the text matches any of our logical operators
    const lowerText = text.toLowerCase();
    
    // Insert text as logical token if it matches if/then/else
    if (["if", "then", "else"].includes(lowerText)) {
      console.log(`[FormulaBuilder] Adding logical token from text: ${lowerText}`);
      onAddLogical(lowerText);
      return;
    }
    
    // Check if it's a number
    if (!isNaN(Number(text))) {
      // Add as number token
      console.log(`[FormulaBuilder] Adding number token from text: ${text}`);
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
      console.log(`[FormulaBuilder] Adding condition operator from text: ${normalizedOperator}`);
      onAddCondition(normalizedOperator);
      return;
    }
    
    // Check if it's a math operator
    const mathOperators = ["+", "-", "*", "/", "(", ")"];
    if (mathOperators.includes(text)) {
      console.log(`[FormulaBuilder] Adding math operator from text: ${text}`);
      onAddOperator(text);
      return;
    }
    
    // Otherwise add as a text token (custom type)
    console.log(`[FormulaBuilder] Adding text token: ${text}`);
    onAddColumn({
      id: `txt-${Date.now()}`,
      title: text,
      type: "text",
      value: text,
      isTextToken: true
    });
  };

  // When a section is clicked, we need to call our section handler
  const handleSectionClickWrapper = (section: "condition" | "then" | "else") => {
    console.log(`[FormulaBuilder] Section click wrapper: ${section}`);
    handleSectionClick(section);
  };

  return (
    <div>
      <FormulaBuilderHeader 
        isLogicTestMode={isLogicTestMode}
        activeSection={activeSection}
      />
      
      <FormulaSections 
        isLogicTestMode={isLogicTestMode}
        activeSection={activeSection}
        formula={formula}
        onSectionClick={handleSectionClickWrapper}
        onRemoveToken={onRemoveToken}
        onAddDirectInput={handleDirectInput}
      />
      
      <FormulaInstructions isLogicTestMode={isLogicTestMode} />
    </div>
  );
};

export default FormulaBuilder;
