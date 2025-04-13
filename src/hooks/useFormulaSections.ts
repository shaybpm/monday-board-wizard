import { useState, useEffect } from 'react';
import { CalculationToken } from '@/types/calculation';
import { toast } from 'sonner';

export const useFormulaSections = (formula: CalculationToken[], onFormulaUpdate: (newFormula: CalculationToken[]) => void) => {
  // Add state for formula mode (calculation or logic test)
  const [isLogicTestMode, setIsLogicTestMode] = useState(() => {
    // Initialize based on formula content - if it has if/then/else tokens, use logic test mode
    return formula.some(token => token.type === "logical" && ["if", "then", "else"].includes(token.value));
  });
  
  // Store separate formulas for each mode
  const [calculationFormula, setCalculationFormula] = useState<CalculationToken[]>([]);
  const [logicTestFormula, setLogicTestFormula] = useState<CalculationToken[]>([]);
  
  // Add state for active section in logic test mode
  const [activeSection, setActiveSection] = useState<"condition" | "then" | "else">("condition");

  // Initialize the appropriate formula arrays when component mounts
  useEffect(() => {
    if (formula.length > 0) {
      if (formula.some(token => token.type === "logical" && ["if", "then", "else"].includes(token.value))) {
        // If formula has logical tokens, it's a logic test formula
        setLogicTestFormula(formula);
      } else {
        // Otherwise it's a calculation formula
        setCalculationFormula(formula);
      }
    }
  }, []);

  // When a formula section is clicked, set it as active
  const handleSectionClick = (section: "condition" | "then" | "else") => {
    setActiveSection(section);
    
    // Visual feedback for which section is active
    toast.info(`Now adding to ${section.toUpperCase()} section`, {
      duration: 1500,
    });
  };

  // Handle mode toggle
  const handleModeToggle = (checked: boolean) => {
    // Save current formula to the appropriate state
    if (!checked && logicTestFormula.length > 0) {
      // Switching from logic test to calculation mode
      setIsLogicTestMode(false);
      // Update the parent component's formula with the calculation formula
      onFormulaUpdate(calculationFormula);
      console.log("[FormulaSections] Switched to calculation mode with formula:", calculationFormula);
      return false; // No need to add IF token
    } else if (checked && calculationFormula.length > 0) {
      // Switching from calculation to logic test mode
      setIsLogicTestMode(true);
      // Update with saved logic test formula if it exists
      if (logicTestFormula.length > 0) {
        onFormulaUpdate(logicTestFormula);
        console.log("[FormulaSections] Restored logic test formula:", logicTestFormula);
        return false; // No need to add IF token
      } else {
        // If no logic test formula exists yet, we need an IF token
        setActiveSection("condition");
        console.log("[FormulaSections] Switched to new logic test mode");
        return true; // Indicate that an IF token needs to be added
      }
    }
    
    // Default behavior - just switch mode
    setIsLogicTestMode(checked);
    setActiveSection("condition");
    return checked && !formula.some(token => token.type === "logical" && token.value === "if");
  };

  // Update the appropriate formula state when the parent formula changes
  useEffect(() => {
    if (formula.length > 0) {
      if (isLogicTestMode) {
        setLogicTestFormula(formula);
      } else {
        setCalculationFormula(formula);
      }
    }
  }, [formula, isLogicTestMode]);

  return {
    isLogicTestMode,
    activeSection,
    handleSectionClick,
    handleModeToggle,
    calculationFormula,
    logicTestFormula
  };
};
