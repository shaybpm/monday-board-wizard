import React, { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { CalculationToken } from "@/types/calculation";
import { FormulaTokensDisplay } from "./formula-display";

interface FormulaSectionsProps {
  isLogicTestMode: boolean;
  activeSection: "condition" | "then" | "else";
  formula: CalculationToken[];
  onSectionClick: (section: "condition" | "then" | "else") => void;
  onRemoveToken: (index: number) => void;
  onAddDirectInput: (text: string, section: "condition" | "then" | "else") => void;
}

const FormulaSections: React.FC<FormulaSectionsProps> = ({
  isLogicTestMode,
  activeSection,
  formula,
  onSectionClick,
  onRemoveToken,
  onAddDirectInput
}) => {
  // Find positions of IF, THEN, and ELSE for dividing the formula
  const ifIndex = formula.findIndex(token => token.type === "logical" && token.value === "if");
  const thenIndex = formula.findIndex(token => token.type === "logical" && token.value === "then");
  const elseIndex = formula.findIndex(token => token.type === "logical" && token.value === "else");
  
  // Log each render with active section and token indices
  useEffect(() => {
    console.log(`[FormulaSections] Rendered with activeSection: ${activeSection}`);
    console.log(`[FormulaSections] Token positions - IF: ${ifIndex}, THEN: ${thenIndex}, ELSE: ${elseIndex}`);
    console.log(`[FormulaSections] Formula:`, formula);
  }, [activeSection, formula, ifIndex, thenIndex, elseIndex]);
  
  // Divide formula into condition, then, and else parts
  const conditionPart = isLogicTestMode 
    ? (thenIndex > -1 ? formula.slice(ifIndex + 1, thenIndex) : (ifIndex > -1 ? formula.slice(ifIndex + 1) : []))
    : formula; // In calculation mode, show the entire formula as the condition part
    
  const thenPart = elseIndex > -1 
    ? formula.slice(thenIndex + 1, elseIndex) 
    : (thenIndex > -1 ? formula.slice(thenIndex + 1) : []);
    
  const elsePart = elseIndex > -1 ? formula.slice(elseIndex + 1) : [];

  // Log the split formula sections
  useEffect(() => {
    console.log(`[FormulaSections] SPLIT FORMULA - Condition tokens: ${conditionPart.length}, Then tokens: ${thenPart.length}, Else tokens: ${elsePart.length}`);
    console.log('[FormulaSections] Condition tokens:', conditionPart);
    console.log('[FormulaSections] Then tokens:', thenPart);
    console.log('[FormulaSections] Else tokens:', elsePart);
  }, [conditionPart, thenPart, elsePart]);

  // Get appropriate style for active section
  const getActiveSectionStyle = (section: "condition" | "then" | "else") => {
    if (!isLogicTestMode) return "";
    
    if (activeSection === section) {
      switch (section) {
        case "condition": return "ring-2 ring-blue-500 ring-offset-2";
        case "then": return "ring-2 ring-green-500 ring-offset-2";
        case "else": return "ring-2 ring-red-500 ring-offset-2";
        default: return "";
      }
    }
    return "";
  };

  // Enhanced click handlers with logging
  const handleSectionClick = (section: "condition" | "then" | "else") => {
    console.log(`[FormulaSections] Section clicked: ${section}`);
    onSectionClick(section);
  };

  // Wrapper functions to ensure each section's direct input is handled correctly
  const handleConditionDirectInput = (text: string) => {
    console.log(`[FormulaSections] Condition direct input: "${text}"`);
    onAddDirectInput(text, "condition");
  };
  
  const handleThenDirectInput = (text: string) => {
    console.log(`[FormulaSections] THEN direct input: "${text}"`);
    onAddDirectInput(text, "then");
  };
  
  const handleElseDirectInput = (text: string) => {
    console.log(`[FormulaSections] ELSE direct input: "${text}"`);
    onAddDirectInput(text, "else");
  };

  // Log token removal with section context
  const logTokenRemoval = (section: string, index: number, adjustedIndex: number) => {
    console.log(`[FormulaSections] Removing token from ${section} section - index: ${index}, adjusted index: ${adjustedIndex}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left side - Condition part */}
      <FormulaTokensDisplay
        tokens={conditionPart.map((token, idx) => ({ ...token, uniqueId: `condition-${token.id}-${idx}` }))}
        label={isLogicTestMode ? "IF condition" : "Formula"}
        emptyMessage={isLogicTestMode ? "Click here to type your condition" : "Build your formula here"}
        className={`${isLogicTestMode ? "bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer" : "bg-gray-50"} ${getActiveSectionStyle("condition")}`}
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
          // For condition part, adjust the index based on mode
          if (isLogicTestMode && ifIndex > -1) {
            const adjustedIndex = index + ifIndex + 1;
            logTokenRemoval("condition", index, adjustedIndex);
            onRemoveToken(adjustedIndex);
          } else {
            // In calculation mode, use the direct index
            logTokenRemoval("condition", index, index);
            onRemoveToken(index);
          }
        }}
        onAddDirectInput={handleConditionDirectInput}
        onClick={() => handleSectionClick("condition")}
        sectionType="condition"
      />
      
      {/* Right side - Only show THEN and ELSE in logic test mode */}
      {isLogicTestMode && (
        <div className="flex flex-col gap-3">
          {/* THEN part */}
          <FormulaTokensDisplay
            tokens={thenPart.map((token, idx) => ({ ...token, uniqueId: `then-${token.id}-${idx}` }))}
            label="THEN (if condition is TRUE)"
            emptyMessage="Click here to type what happens when condition is true"
            className={`bg-green-50 hover:bg-green-100 transition-colors cursor-pointer ${getActiveSectionStyle("then")}`}
            badgePrefix={thenIndex > -1 ? (
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
              logTokenRemoval("then", index, adjustedIndex);
              onRemoveToken(adjustedIndex);
            }}
            onAddDirectInput={handleThenDirectInput}
            onClick={() => handleSectionClick("then")}
            sectionType="then"
          />
          
          {/* ELSE part */}
          <FormulaTokensDisplay
            tokens={elsePart.map((token, idx) => ({ ...token, uniqueId: `else-${token.id}-${idx}` }))}
            label="ELSE (if condition is FALSE)"
            emptyMessage="Click here to type what happens when condition is false"
            className={`bg-red-50 hover:bg-red-100 transition-colors cursor-pointer ${getActiveSectionStyle("else")}`}
            badgePrefix={elseIndex > -1 ? (
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
              logTokenRemoval("else", index, adjustedIndex);
              onRemoveToken(adjustedIndex);
            }}
            onAddDirectInput={handleElseDirectInput}
            onClick={() => handleSectionClick("else")}
            sectionType="else"
          />
        </div>
      )}
    </div>
  );
};

export default FormulaSections;
