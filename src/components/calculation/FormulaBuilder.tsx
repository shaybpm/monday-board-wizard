
import React, { useCallback } from "react";
import { CalculationToken } from "@/types/calculation";
import FormulaBuilderHeader from "./FormulaBuilderHeader";
import FormulaSections from "./FormulaSections";
import FormulaInstructions from "./FormulaInstructions";
import SectionManager from "./formula-builder/SectionManager";
import { useFormulaBuilderHandlers } from "@/hooks/useFormulaBuilderHandlers";

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
  
  // Callback for formula updates in section mode switches
  const handleFormulaUpdate = useCallback((newFormula: CalculationToken[]) => {
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
  }, [formula, onAddColumn, onAddOperator, onRemoveToken, onAddCondition, onAddLogical]);

  return (
    <div>
      <SectionManager
        formula={formula}
        isLogicTestMode={isLogicTestMode}
        onFormulaUpdate={handleFormulaUpdate}
      >
        {({ activeSection, handleSectionClick }) => {
          // Only initialize formula handlers once we have the active section
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
        }}
      </SectionManager>
    </div>
  );
};

export default FormulaBuilder;
