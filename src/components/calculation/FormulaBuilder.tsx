
import React from "react";
import { CalculationToken } from "@/types/calculation";
import LogicalOperators from "./LogicalOperators";
import FormulaOperators from "./FormulaOperators";
import FormulaExample from "./FormulaExample";
import FormulaBuilderHeader from "./FormulaBuilderHeader";
import FormulaSections from "./FormulaSections";
import FormulaInstructions from "./FormulaInstructions";
import { useFormulaSections } from "@/hooks/useFormulaSections";
import { useFormulaTokenAdder } from "@/hooks/useFormulaTokenAdder";

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
  
  // Use our custom hook for token adding logic
  const {
    handleAddColumnWrapped,
    handleAddOperatorWrapped,
    handleAddNumberWrapped,
    handleAddConditionWrapped
  } = useFormulaTokenAdder(
    formula,
    isLogicTestMode,
    activeSection,
    // Pass the actual handler functions
    (token) => {
      // This is a simple pass-through since we're using the external handlers
      if (token.type === "column") {
        const column = { id: token.value, title: token.display };
        onAddColumn(column);
      } else if (token.type === "operator") {
        onAddOperator(token.value);
      } else if (token.type === "number") {
        onAddNumber();
      } else if (token.type === "condition") {
        onAddCondition(token.value);
      }
    },
    onAddLogical
  );
  
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
