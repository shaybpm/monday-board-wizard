
import React, { useCallback } from "react";
import { CalculationToken } from "@/types/calculation";
import { toast } from "sonner";

interface FormulaUpdaterProps {
  formula: CalculationToken[];
  onAddColumn: (column: any) => void;
  onAddOperator: (operator: string) => void;
  onAddCondition: (condition: string) => void;
  onAddLogical: (logical: string) => void;
  onRemoveToken: (index: number) => void;
  children: (handleFormulaUpdate: (newFormula: CalculationToken[]) => void) => React.ReactNode;
}

/**
 * Component that handles formula updates and provides the update handler to children
 */
const FormulaUpdater: React.FC<FormulaUpdaterProps> = ({
  formula,
  onAddColumn,
  onAddOperator,
  onAddCondition,
  onAddLogical,
  onRemoveToken,
  children
}) => {
  // Callback for formula updates in section mode switches
  const handleFormulaUpdate = useCallback((newFormula: CalculationToken[]) => {
    console.log("[FormulaUpdater] Formula update callback triggered with new formula:", newFormula);
    
    if (newFormula.length === 0) {
      // If the new formula is empty, just clear the current formula
      while (formula.length > 0) {
        onRemoveToken(0);
      }
      return;
    }
    
    // Clear the current formula and add all tokens from newFormula
    if (newFormula.length > 0) {
      try {
        // Remove all tokens from current formula
        while (formula.length > 0) {
          onRemoveToken(0);
        }
        
        // Add all tokens from the saved formula for the selected mode
        newFormula.forEach(token => {
          console.log(`Adding token: ${token.type} - ${token.value} - ${token.display}`);
          
          if (token.type === "column") {
            onAddColumn({ id: token.value, title: token.display });
          } else if (token.type === "operator") {
            onAddOperator(token.value);
          } else if (token.type === "number") {
            onAddColumn({
              id: token.id || `num-${Date.now()}`,
              title: token.display,
              type: "number",
              value: token.value,
              isNumberToken: true
            });
          } else if (token.type === "condition") {
            onAddCondition(token.value);
          } else if (token.type === "logical") {
            console.log(`[FormulaUpdater] Adding logical token: ${token.value}`);
            onAddLogical(token.value);
          } else {
            console.warn(`Unknown token type: ${token.type}`);
          }
        });
      } catch (error) {
        console.error("Error updating formula:", error);
        toast.error("Error updating formula");
      }
    }
  }, [formula, onAddColumn, onAddOperator, onAddCondition, onAddLogical, onRemoveToken]);

  return <>{children(handleFormulaUpdate)}</>;
};

export default FormulaUpdater;
