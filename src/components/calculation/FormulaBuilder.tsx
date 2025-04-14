
import React from "react";
import { CalculationToken } from "@/types/calculation";
import LogicalOperators from "./LogicalOperators";
import FormulaOperators from "./FormulaOperators";
import FormulaExample from "./FormulaExample";
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
  isLogicTestMode: boolean;  // Added this prop
}

const FormulaBuilder: React.FC<FormulaBuilderProps> = ({
  formula,
  onAddColumn,
  onAddOperator,
  onAddNumber,
  onRemoveToken,
  onAddCondition,
  onAddLogical,
  isLogicTestMode,  // Use the passed prop
}) => {
  console.log("FormulaBuilder - Is Logic Test Mode:", isLogicTestMode);
  
  // Use our custom hook for section management with formula update callback
  const {
    activeSection,
    handleSectionClick
  } = useFormulaSections(formula, (newFormula) => {
    // This would be called when we need to update the formula after mode switch
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
          onAddLogical(token.value);
        }
      });
    }
  }, isLogicTestMode);  // Pass the mode from props
  
  // Use our refactored hooks system for token handling
  const {
    handleAddColumnWrapped,
    handleAddOperatorWrapped,
    handleAddNumberWrapped,
    handleAddConditionWrapped
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
      }
    },
    onAddLogical
  });

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
        onSectionClick={handleSectionClick}
        onRemoveToken={onRemoveToken}
      />
      
      <FormulaInstructions isLogicTestMode={isLogicTestMode} />
      
      {/* Logic Operators - only visible in logic test mode */}
      {isLogicTestMode && (
        <LogicalOperators
          onAddCondition={handleAddConditionWrapped}
          onAddLogical={onAddLogical}
        />
      )}
      
      {/* Math Operators - always visible */}
      <FormulaOperators
        onAddOperator={handleAddOperatorWrapped}
        onAddNumber={handleAddNumberWrapped}
      />
      
      {/* Info panel with example */}
      <FormulaExample isLogicTestMode={isLogicTestMode} />
    </div>
  );
};

export default FormulaBuilder;
