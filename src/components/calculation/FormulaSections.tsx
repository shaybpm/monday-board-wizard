
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CalculationToken } from "@/types/calculation";
import FormulaTokensDisplay from "./FormulaTokensDisplay";

interface FormulaSectionsProps {
  isLogicTestMode: boolean;
  activeSection: "condition" | "then" | "else";
  formula: CalculationToken[];
  onSectionClick: (section: "condition" | "then" | "else") => void;
  onRemoveToken: (index: number) => void;
}

const FormulaSections: React.FC<FormulaSectionsProps> = ({
  isLogicTestMode,
  activeSection,
  formula,
  onSectionClick,
  onRemoveToken
}) => {
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

  // Get appropriate style for active section
  const getActiveSectionStyle = (section: "condition" | "then" | "else") => {
    if (!isLogicTestMode) return "";
    if (activeSection === section) {
      return "ring-2 ring-offset-2 ";
    }
    return "";
  };

  return (
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
        // Important: Removed the disabled={isLogicTestMode && ifIndex === -1} condition
        // to allow clicking on the condition section even when there's no IF token yet
        onClick={() => onSectionClick("condition")}
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
          onClick={() => onSectionClick("then")}
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
          onClick={() => onSectionClick("else")}
        />
      </div>
    </div>
  );
};

export default FormulaSections;
