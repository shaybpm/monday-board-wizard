
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CalculationToken } from "@/types/calculation";
import FormulaTokensDisplay from "./FormulaTokensDisplay";
import FormulaOperators from "./FormulaOperators";
import LogicalOperators from "./LogicalOperators";
import FormulaExample from "./FormulaExample";

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
  // Add state for formula mode (calculation or logic test)
  const [isLogicTestMode, setIsLogicTestMode] = useState(() => {
    // Initialize based on formula content - if it has if/then/else tokens, use logic test mode
    return formula.some(token => token.type === "logical" && ["if", "then", "else"].includes(token.value));
  });
  
  // Find positions of IF, THEN, and ELSE for dividing the formula
  const ifIndex = formula.findIndex(token => token.type === "logical" && token.value === "if");
  const thenIndex = formula.findIndex(token => token.type === "logical" && token.value === "then");
  const elseIndex = formula.findIndex(token => token.type === "logical" && token.value === "else");
  
  // Divide formula into condition, then, and else parts
  const conditionPart = thenIndex > -1 ? formula.slice(0, thenIndex) : formula;
  const thenPart = elseIndex > -1 
    ? formula.slice(thenIndex + 1, elseIndex) 
    : (thenIndex > -1 ? formula.slice(thenIndex + 1) : []);
  const elsePart = elseIndex > -1 ? formula.slice(elseIndex + 1) : [];

  // Handle mode toggle
  const handleModeToggle = (checked: boolean) => {
    setIsLogicTestMode(checked);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-medium">Formula Builder</h3>
        
        {/* Mode toggle switch */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Calculation</span>
          <Switch 
            checked={isLogicTestMode} 
            onCheckedChange={handleModeToggle}
            id="mode-toggle"
          />
          <span className="text-sm font-medium text-gray-700">Logic Test</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left side - Condition part */}
        <FormulaTokensDisplay
          tokens={conditionPart}
          label={isLogicTestMode ? "IF condition" : "Formula"}
          emptyMessage={isLogicTestMode ? "Build your condition here" : "Build your formula here"}
          badgePrefix={isLogicTestMode && ifIndex > -1 ? (
            <Badge 
              key="if-label"
              variant="default"
              className="px-3 py-1 bg-blue-500"
            >
              IF
            </Badge>
          ) : null}
          onRemoveToken={onRemoveToken}
        />
        
        {/* Right side - divided into THEN and ELSE sections */}
        <div className="flex flex-col gap-3">
          {/* THEN part */}
          <FormulaTokensDisplay
            tokens={thenPart}
            label="THEN (if condition is TRUE)"
            emptyMessage={isLogicTestMode ? "Add what should happen when condition is true" : "Not available in calculation mode"}
            className={isLogicTestMode ? "bg-green-50" : "bg-gray-100"}
            badgePrefix={isLogicTestMode && thenIndex > -1 ? (
              <Badge 
                key="then-label"
                variant="default"
                className="px-3 py-1 bg-green-500"
              >
                THEN
              </Badge>
            ) : null}
            onRemoveToken={onRemoveToken}
            startIndex={thenIndex + 1}
            disabled={!isLogicTestMode}
          />
          
          {/* ELSE part */}
          <FormulaTokensDisplay
            tokens={elsePart}
            label="ELSE (if condition is FALSE)"
            emptyMessage={isLogicTestMode ? "Add what should happen when condition is false" : "Not available in calculation mode"}
            className={isLogicTestMode ? "bg-red-50" : "bg-gray-100"}
            badgePrefix={isLogicTestMode && elseIndex > -1 ? (
              <Badge 
                key="else-label"
                variant="default"
                className="px-3 py-1 bg-red-500"
              >
                ELSE
              </Badge>
            ) : null}
            onRemoveToken={onRemoveToken}
            startIndex={elseIndex + 1}
            disabled={!isLogicTestMode}
          />
        </div>
      </div>
      
      {/* Logic Operators - only visible in logic test mode */}
      {isLogicTestMode && (
        <LogicalOperators
          onAddCondition={onAddCondition}
          onAddLogical={onAddLogical}
        />
      )}
      
      {/* Math Operators - always visible */}
      <FormulaOperators
        onAddOperator={onAddOperator}
        onAddNumber={onAddNumber}
      />
      
      {/* Info panel with example */}
      <FormulaExample isLogicTestMode={isLogicTestMode} />
    </div>
  );
};

export default FormulaBuilder;
