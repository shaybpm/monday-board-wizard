
import React from "react";
import { CalculationToken } from "@/types/calculation";
import SectionManager from "./formula-builder/SectionManager";
import FormulaUpdater from "./formula-builder/FormulaUpdater";
import FormulaBuilderContent from "./formula-builder/FormulaBuilderContent";

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
  console.log("FormulaBuilder - Current formula:", formula);
  
  return (
    <div>
      <FormulaUpdater
        formula={formula}
        onAddColumn={onAddColumn}
        onAddOperator={onAddOperator}
        onAddCondition={onAddCondition}
        onAddLogical={onAddLogical}
        onRemoveToken={onRemoveToken}
      >
        {(handleFormulaUpdate) => (
          <SectionManager
            formula={formula}
            isLogicTestMode={isLogicTestMode}
            onFormulaUpdate={handleFormulaUpdate}
          >
            {({ activeSection, handleSectionClick }) => (
              <FormulaBuilderContent
                formula={formula}
                activeSection={activeSection}
                isLogicTestMode={isLogicTestMode}
                handleSectionClick={handleSectionClick}
                onAddColumn={onAddColumn}
                onAddOperator={onAddOperator}
                onAddNumber={onAddNumber}
                onRemoveToken={onRemoveToken}
                onAddCondition={onAddCondition}
                onAddLogical={onAddLogical}
              />
            )}
          </SectionManager>
        )}
      </FormulaUpdater>
    </div>
  );
};

export default FormulaBuilder;
