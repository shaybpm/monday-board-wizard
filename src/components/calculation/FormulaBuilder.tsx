
import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CalculationToken } from "@/types/calculation";
import FormulaTokensDisplay from "./FormulaTokensDisplay";
import FormulaOperators from "./FormulaOperators";
import LogicalOperators from "./LogicalOperators";
import FormulaExample from "./FormulaExample";
import { toast } from "sonner";

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
  
  // Add state for active section in logic test mode
  const [activeSection, setActiveSection] = useState<"condition" | "then" | "else">("condition");

  // Find positions of IF, THEN, and ELSE for dividing the formula
  const ifIndex = formula.findIndex(token => token.type === "logical" && token.value === "if");
  const thenIndex = formula.findIndex(token => token.type === "logical" && token.value === "then");
  const elseIndex = formula.findIndex(token => token.type === "logical" && token.value === "else");
  
  // Divide formula into condition, then, and else parts
  const conditionPart = thenIndex > -1 ? formula.slice(ifIndex + 1, thenIndex) : 
                        (ifIndex > -1 ? formula.slice(ifIndex + 1) : formula);
  
  const thenPart = elseIndex > -1 
    ? formula.slice(thenIndex + 1, elseIndex) 
    : (thenIndex > -1 ? formula.slice(thenIndex + 1) : []);
    
  const elsePart = elseIndex > -1 ? formula.slice(elseIndex + 1) : [];

  // Helper to wrap token additions with appropriate section logic
  const addTokenToFormula = (tokenGenerator: Function) => {
    // For calculation mode, just add to the end
    if (!isLogicTestMode) {
      const newToken = tokenGenerator();
      onRemoveToken(-1); // Trick to get formula to update without modifying it
      formula.push(newToken);
      return;
    }
    
    // For logic test mode, add to the active section
    switch (activeSection) {
      case "condition":
        if (ifIndex === -1) {
          // If there's no IF yet, add it first
          toast.warning("Add an IF operator first", {
            description: "Click the IF button before adding other elements to your condition"
          });
          return;
        }
        const conditionToken = tokenGenerator();
        const conditionInsertIndex = thenIndex > -1 ? thenIndex : formula.length;
        formula.splice(conditionInsertIndex, 0, conditionToken);
        onRemoveToken(-1); // Trick to update formula
        break;
      
      case "then":
        if (thenIndex === -1) {
          // If there's no THEN yet, add it first
          toast.warning("Add a THEN operator first", {
            description: "Click the THEN button before adding elements to your THEN section"
          });
          return;
        }
        const thenToken = tokenGenerator();
        const thenInsertIndex = elseIndex > -1 ? elseIndex : formula.length;
        formula.splice(thenInsertIndex, 0, thenToken);
        onRemoveToken(-1); // Trick to update formula
        break;
      
      case "else":
        if (elseIndex === -1) {
          // If there's no ELSE yet, add it first
          toast.warning("Add an ELSE operator first", {
            description: "Click the ELSE button before adding elements to your ELSE section"
          });
          return;
        }
        const elseToken = tokenGenerator();
        formula.push(elseToken);
        onRemoveToken(-1); // Trick to update formula
        break;
    }
  };

  // Override handlers to use our section-aware logic
  const handleAddColumnWrapped = (column: any) => {
    addTokenToFormula(() => ({
      id: column.id,
      type: "column" as const,
      value: column.id,
      display: column.title
    }));
  };

  const handleAddOperatorWrapped = (operator: string) => {
    addTokenToFormula(() => ({
      id: `op-${Date.now()}`,
      type: "operator" as const,
      value: operator,
      display: operator
    }));
  };

  const handleAddNumberWrapped = () => {
    const number = prompt("Enter a number:");
    if (number && !isNaN(Number(number))) {
      addTokenToFormula(() => ({
        id: `num-${Date.now()}`,
        type: "number" as const,
        value: number,
        display: number
      }));
    }
  };

  const handleAddConditionWrapped = (condition: string) => {
    addTokenToFormula(() => ({
      id: `cond-${Date.now()}`,
      type: "condition" as const,
      value: condition,
      display: condition
    }));
  };

  // Handle mode toggle
  const handleModeToggle = (checked: boolean) => {
    setIsLogicTestMode(checked);
    setActiveSection("condition");
    
    // If switching to logic test mode and no IF token yet, add one
    if (checked && ifIndex === -1) {
      onAddLogical("if");
    }
  };

  // When a formula section is clicked, set it as active
  const handleSectionClick = (section: "condition" | "then" | "else") => {
    setActiveSection(section);
    
    // Visual feedback for which section is active
    toast.info(`Now adding to ${section.toUpperCase()} section`, {
      duration: 1500,
    });
  };

  // Helper to determine if a section should be marked as active
  const isSectionActive = (section: "condition" | "then" | "else") => {
    return isLogicTestMode && activeSection === section;
  };

  // Get appropriate style for active section
  const getActiveSectionStyle = (section: "condition" | "then" | "else") => {
    if (!isLogicTestMode) return "";
    if (activeSection === section) {
      return "ring-2 ring-offset-2 ";
    }
    return "";
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
      
      {isLogicTestMode && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
          <div className="text-sm text-blue-600 font-medium">
            <p>Active section: <span className="font-bold">{activeSection.toUpperCase()}</span></p>
            <p className="mt-1">Click on any section below to make it active, then add elements to it.</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left side - Condition part */}
        <FormulaTokensDisplay
          tokens={conditionPart}
          label={isLogicTestMode ? "IF condition" : "Formula"}
          emptyMessage={isLogicTestMode ? "Build your condition here" : "Build your formula here"}
          className={`${isLogicTestMode ? "bg-blue-50" : "bg-gray-50"} ${getActiveSectionStyle("condition")}`}
          badgePrefix={isLogicTestMode && ifIndex > -1 ? (
            <Badge 
              key="if-label"
              variant="default"
              className="px-3 py-1 bg-blue-500"
            >
              IF
            </Badge>
          ) : null}
          onRemoveToken={(index) => {
            // For condition part, we need to adjust the index if if-token exists
            const adjustedIndex = ifIndex > -1 ? index + ifIndex + 1 : index;
            onRemoveToken(adjustedIndex);
          }}
          disabled={isLogicTestMode && !ifIndex} 
          onClick={() => handleSectionClick("condition")}
        />
        
        {/* Right side - divided into THEN and ELSE sections */}
        <div className="flex flex-col gap-3">
          {/* THEN part */}
          <FormulaTokensDisplay
            tokens={thenPart}
            label="THEN (if condition is TRUE)"
            emptyMessage={isLogicTestMode ? "Add what should happen when condition is true" : "Not available in calculation mode"}
            className={`${isLogicTestMode ? "bg-green-50" : "bg-gray-100"} ${getActiveSectionStyle("then")}`}
            badgePrefix={isLogicTestMode && thenIndex > -1 ? (
              <Badge 
                key="then-label"
                variant="default"
                className="px-3 py-1 bg-green-500"
              >
                THEN
              </Badge>
            ) : null}
            onRemoveToken={(index) => {
              // For then part, adjust the index
              const adjustedIndex = index + thenIndex + 1;
              onRemoveToken(adjustedIndex);
            }}
            disabled={!isLogicTestMode || thenIndex === -1}
            onClick={() => handleSectionClick("then")}
          />
          
          {/* ELSE part */}
          <FormulaTokensDisplay
            tokens={elsePart}
            label="ELSE (if condition is FALSE)"
            emptyMessage={isLogicTestMode ? "Add what should happen when condition is false" : "Not available in calculation mode"}
            className={`${isLogicTestMode ? "bg-red-50" : "bg-gray-100"} ${getActiveSectionStyle("else")}`}
            badgePrefix={isLogicTestMode && elseIndex > -1 ? (
              <Badge 
                key="else-label"
                variant="default"
                className="px-3 py-1 bg-red-500"
              >
                ELSE
              </Badge>
            ) : null}
            onRemoveToken={(index) => {
              // For else part, adjust the index
              const adjustedIndex = index + elseIndex + 1;
              onRemoveToken(adjustedIndex);
            }}
            disabled={!isLogicTestMode || elseIndex === -1}
            onClick={() => handleSectionClick("else")}
          />
        </div>
      </div>
      
      {/* Active Section Indicator */}
      {isLogicTestMode && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            <strong>Step-by-step:</strong> 
            <ol className="mt-1 list-decimal list-inside">
              <li>First add IF, THEN, and ELSE operators using the buttons below</li>
              <li>Click on a section to make it active (blue border)</li>
              <li>Add columns, numbers, and operators to the active section</li>
            </ol>
          </p>
        </div>
      )}
      
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
