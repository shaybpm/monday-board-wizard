
import React from "react";
import { CalculationToken } from "@/types/calculation";
import LogicalOperators from "./LogicalOperators";
import FormulaOperators from "./FormulaOperators";
import FormulaExample from "./FormulaExample";
import FormulaBuilderHeader from "./FormulaBuilderHeader";
import FormulaSections from "./FormulaSections";
import FormulaInstructions from "./FormulaInstructions";
import { useFormulaSections } from "@/hooks/useFormulaSections";
import { useFormulaTokens } from "@/hooks/formula/useFormulaTokens";

interface FormulaBuilderProps {
  formula: CalculationToken[];
  onAddColumn: (column: any) => void;
  onAddOperator: (operator: string) => void;
  onAddNumber: () => void;
  onRemoveToken: (index: number) => void;
  onAddCondition: (condition: string) => void;
  onAddLogical: (logical: string) => void;
}

const FormulaBuilder: React.FC<FormulaBuilderProps> = ({
  formula,
  onAddColumn,
  onAddOperator,
  onAddNumber,
  onRemoveToken,
  onAddCondition,
  onAddLogical,
}) => {
  // Use our custom hook for section management
  const {
    isLogicTestMode,
    activeSection,
    handleSectionClick,
    handleModeToggle
  } = useFormulaSections(formula);
  
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
      // This is a simple pass-through to the respective handlers
      if (token.type === "column") {
        const column = { id: token.value, title: token.display };
        onAddColumn(column);
      } else if (token.type === "operator") {
        onAddOperator(token.value);
      } else if (token.type === "number") {
        console.log("[FormulaBuilder] Adding number token directly to formula");
        // Bypass the original number input process and add directly
        onAddColumn({
          id: token.id,
          title: token.display,
          value: token.value,
          type: "number"
        });
      } else if (token.type === "condition") {
        onAddCondition(token.value);
      }
    },
    onAddLogical
  });
  
  // Handle mode toggle with IF token check
  const handleModeToggleWithIFCheck = (checked: boolean) => {
    const needsIfToken = handleModeToggle(checked);
    
    // If switching to logic test mode and no IF token yet, add one
    if (needsIfToken) {
      onAddLogical("if");
    }
  };

  return (
    <div>
      <FormulaBuilderHeader 
        isLogicTestMode={isLogicTestMode}
        activeSection={activeSection}
        onModeToggle={handleModeToggleWithIFCheck}
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
