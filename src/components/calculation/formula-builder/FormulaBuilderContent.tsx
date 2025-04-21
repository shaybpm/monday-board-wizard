
import React from "react";
import { useFormulaBuilderHandlers } from "@/hooks/useFormulaBuilderHandlers";
import FormulaBuilderHeader from "@/components/calculation/FormulaBuilderHeader";
import FormulaSections from "@/components/calculation/FormulaSections";
import FormulaInstructions from "@/components/calculation/FormulaInstructions";
import { CalculationToken } from "@/types/calculation";

interface FormulaBuilderContentProps {
  formula: CalculationToken[];
  activeSection: "condition" | "then" | "else";
  isLogicTestMode: boolean;
  handleSectionClick: (section: "condition" | "then" | "else") => void;
  onAddColumn: (column: any) => void;
  onAddOperator: (operator: string) => void;
  onAddNumber: () => void;
  onRemoveToken: (index: number) => void;
  onAddCondition: (condition: string) => void;
  onAddLogical: (logical: string) => void;
}

const FormulaBuilderContent: React.FC<FormulaBuilderContentProps> = ({
  formula,
  activeSection,
  isLogicTestMode,
  handleSectionClick,
  onAddColumn,
  onAddOperator,
  onAddNumber,
  onRemoveToken,
  onAddCondition,
  onAddLogical
}) => {
  // Initialize formula handlers with the active section
  const {
    handleAddColumnWrapped,
    handleDirectInput
  } = useFormulaBuilderHandlers({
    formula,
    isLogicTestMode,
    activeSection,
    onAddColumn,
    onAddOperator,
    onAddNumber,
    onRemoveToken,
    onAddCondition,
    onAddLogical
  });

  return (
    <>
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
        onAddDirectInput={handleDirectInput}
      />
      
      <FormulaInstructions isLogicTestMode={isLogicTestMode} />
    </>
  );
};

export default FormulaBuilderContent;
